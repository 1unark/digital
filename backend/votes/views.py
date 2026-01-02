from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import Vote
from posts.models import Post
from .serializers import VoteSerializer

class VoteCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        vote_type = request.data.get('vote_type')
        if vote_type not in [1, 2]:
            return Response({'error': 'vote_type must be 1 or 2'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            vote, created = Vote.objects.update_or_create(
                user=request.user,
                post=post,
                defaults={'vote_type': vote_type}
            )
            
            # Recalculate post scores
            if vote_type == 1:
                if created:
                    post.plus_one_count += 1
                elif vote.vote_type == 2:
                    post.plus_two_count -= 1
                    post.plus_one_count += 1
            else:  # vote_type == 2
                if created:
                    post.plus_two_count += 1
                elif vote.vote_type == 1:
                    post.plus_one_count -= 1
                    post.plus_two_count += 1
            
            post.calculate_score()
            
            # Update user points
            post.user.total_points = post.user.total_points + vote_type
            post.user.save(update_fields=['total_points'])
        
        return Response({'message': 'Vote recorded'}, status=status.HTTP_201_CREATED)

class VoteDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, post_id):
        try:
            vote = Vote.objects.get(user=request.user, post_id=post_id)
        except Vote.DoesNotExist:
            return Response({'error': 'Vote not found'}, status=status.HTTP_404_NOT_FOUND)
        
        with transaction.atomic():
            post = vote.post
            
            if vote.vote_type == 1:
                post.plus_one_count -= 1
            else:
                post.plus_two_count -= 1
            
            post.calculate_score()
            
            # Update user points
            post.user.total_points -= vote.vote_type
            post.user.save(update_fields=['total_points'])
            
            vote.delete()
        
        return Response({'message': 'Vote removed'}, status=status.HTTP_204_NO_CONTENT)
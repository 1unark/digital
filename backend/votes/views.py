from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Sum
from .models import Vote
from posts.models import Post
from .serializers import VoteSerializer

class VoteCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, post_id):
        print(f"Vote request - User: {request.user}, Post: {post_id}, Data: {request.data}")
        
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        vote_value = request.data.get('vote_type')
        if vote_value is None:
            vote_value = request.data.get('value')
        if vote_value not in [1, 2]:
            return Response({'error': 'vote_type must be 1 or 2'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            try:
                existing_vote = Vote.objects.get(user=request.user, post=post)
                old_value = existing_vote.value
                print(f"Updating existing vote from {old_value} to {vote_value}")
                existing_vote.value = vote_value
                existing_vote.save()
                
                if old_value == 1 and vote_value == 2:
                    post.plus_one_count -= 1
                    post.plus_two_count += 1
                elif old_value == 2 and vote_value == 1:
                    post.plus_two_count -= 1
                    post.plus_one_count += 1
                    
            except Vote.DoesNotExist:
                print(f"Creating new vote with value {vote_value}")
                Vote.objects.create(
                    user=request.user,
                    post=post,
                    value=vote_value
                )
                if vote_value == 1:
                    post.plus_one_count += 1
                else:
                    post.plus_two_count += 1
            
            print(f"Before save - +1: {post.plus_one_count}, +2: {post.plus_two_count}")
            post.calculate_score()
            print(f"After calculate_score - Score: {post.total_score}")
            
            post.user.total_points = Post.objects.filter(user=post.user).aggregate(
                total=Sum('total_score')
            )['total'] or 0
            post.user.save(update_fields=['total_points'])
        
        print(f"Vote saved successfully")
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
            
            if vote.value == 1:
                post.plus_one_count -= 1
            else:
                post.plus_two_count -= 1
            
            post.calculate_score()
            
            post.user.total_points = Post.objects.filter(user=post.user).aggregate(
                total=Sum('total_score')
            )['total'] or 0
            post.user.save(update_fields=['total_points'])
            
            vote.delete()
        
        return Response({'message': 'Vote removed'}, status=status.HTTP_204_NO_CONTENT)
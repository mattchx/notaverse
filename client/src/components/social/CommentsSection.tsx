import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Trash2, Edit2, Send } from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle 
} from '../ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '../ui/avatar';
import { get, post, put, del } from '../../utils/api';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name?: string;
    avatarUrl?: string;
  };
}

interface CommentsResponse {
  success: boolean;
  data: Comment[];
}

interface CommentResponse {
  success: boolean;
  data: Comment;
}

interface CommentsSectionProps {
  markerId: string;
}

export function CommentsSection({ markerId }: CommentsSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch comments for the marker
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await get<CommentsResponse>(`/comments/marker/${markerId}`);
        setComments(response.data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [markerId]);

  // Handle adding a new comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await post<CommentResponse>('/comments', {
        markerId,
        content: newComment.trim(),
      });
      
      // Add the new comment to the list
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating a comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setIsLoading(true);
    try {
      const response = await put<CommentResponse>(`/comments/${commentId}`, {
        content: editContent.trim(),
      });
      
      setComments(
        comments.map((comment) =>
          comment.id === commentId ? response.data : comment
        )
      );
      setEditingCommentId(null);
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await del(`/comments/${commentId}`);
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Start editing a comment
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  // Generate initials for avatar fallback
  const getInitials = (name: string | null | undefined) => {
    // Use a default name if name is null or undefined
    const userName = name || 'Anonymous User';
    
    return userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-full space-y-4">
      <CardTitle className="text-xl">Comments</CardTitle>
      
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id} className="overflow-hidden">
              <CardHeader className="pb-2 pt-3 px-4 flex flex-row gap-2 items-center">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={comment.user.avatarUrl} />
                  <AvatarFallback>
                    {getInitials(comment.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0">
                  <p className="font-semibold text-sm">
                    {comment.user.name || 'Anonymous User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
                
                {isAuthenticated && user?.id === comment.user.id && (
                  <div className="ml-auto flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => startEditing(comment)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="px-4 py-2">
                {editingCommentId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Edit your comment..."
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelEditing}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={isLoading || !editContent.trim()}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {isAuthenticated ? (
        <form onSubmit={handleAddComment} className="pt-2">
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[80px] flex-1"
            />
          </div>
          <div className="flex justify-end mt-2">
            <Button 
              type="submit" 
              disabled={isLoading || !newComment.trim()}
              className="gap-1"
            >
              <Send className="h-4 w-4" />
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            You must be signed in to add a comment.
          </p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
        </Card>
      )}
    </div>
  );
} 
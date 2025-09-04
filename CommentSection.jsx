import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CommentSection = () => {
  const [comments, setComments] = useState([
    {
      id: 1,
      user: 'Jaymark Flordeiza',
      text: 'Love this song! It\'s been on repeat all week.',
      time: '2 hours ago',
      avatar: 'https://randomuser.me/api/portraits/men/40.jpg',
      likes: 12
    },
    {
      id: 2,
      user: 'Carl Romanda',
      text: 'The lyrics are so meaningful. Really connects with what I\'m going through right now.',
      time: '5 hours ago',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      likes: 8
    },
  ]);
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeComment, setActiveComment] = useState(null);

  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    
    const comment = {
      id: comments.length + 1,
      user: 'Jubelle Franze Mabalatan',
      text: newComment,
      time: 'Just now',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      likes: 1000000,
      replyingTo: replyingTo
    };
    
    setComments([...comments, comment]);
    setNewComment('');
    setReplyingTo(null);
  };

  const handleLikeComment = (id) => {
    setComments(comments.map(comment => 
      comment.id === id 
        ? { ...comment, likes: comment.likes + 1 } 
        : comment
    ));
  };

  const handleReply = (user) => {
    setReplyingTo(user);
    setNewComment(`@${user} `);
  };

  const formatLikes = (count) => {
    if (count < 1000) return count;
    return `${(count / 1000).toFixed(1)}k`;
    if (count < 1000000) return count;
    return `${(count/1000000).toFixed(1)}m`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={90}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comments ({comments.length})</Text>
          <TouchableOpacity>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.commentsContainer}>
          {comments.map(comment => (
            <View 
              key={comment.id} 
              style={[
                styles.comment, 
                comment.replyingTo && styles.replyComment
              ]}
              onTouchStart={() => setActiveComment(comment.id)}
            >
              <Image 
                source={{ uri: comment.avatar }} 
                style={styles.avatar}
              />
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.userName}>{comment.user}</Text>
                  <Text style={styles.time}>{comment.time}</Text>
                </View>
                {comment.replyingTo && (
                  <Text style={styles.replyingTo}>Replying to @{comment.replyingTo}</Text>
                )}
                <Text style={styles.commentText}>{comment.text}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLikeComment(comment.id)}
                  >
                    <Ionicons 
                      name="heart-outline" 
                      size={16} 
                      color="#666" 
                    />
                    <Text style={styles.actionText}>
                      {formatLikes(comment.likes)}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleReply(comment.user)}
                  >
                    <Ionicons 
                      name="arrow-undo-outline" 
                      size={16} 
                      color="#666" 
                    />
                    <Text style={styles.actionText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyingToContainer}>
              <Text style={styles.replyingToText}>
                Replying to @{replyingTo}
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} 
              style={styles.userAvatar}
            />
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                newComment === '' && styles.sendButtonDisabled
              ]}
              onPress={handleAddComment}
              disabled={newComment === ''}
            >
              <Ionicons 
                name="arrow-up-circle" 
                size={32} 
                color={newComment === '' ? "#ccc" : "#1877F2"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  comment: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  replyComment: {
    marginLeft: 40,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  avatar: {
    width: isSmallScreen ? 36 : 40,
    height: isSmallScreen ? 36 : 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: isSmallScreen ? 14 : 16,
  },
  time: {
    color: '#666',
    fontSize: isSmallScreen ? 12 : 14,
  },
  replyingTo: {
    color: '#1877F2',
    fontSize: isSmallScreen ? 12 : 14,
    marginBottom: 4,
  },
  commentText: {
    fontSize: isSmallScreen ? 14 : 16,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    color: '#666',
    fontSize: isSmallScreen ? 12 : 14,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
    backgroundColor: '#fff',
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  replyingToText: {
    color: '#1877F2',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: isSmallScreen ? 32 : 36,
    height: isSmallScreen ? 32 : 36,
    borderRadius: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: isSmallScreen ? 14 : 16,
  },
  sendButton: {
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default CommentSection;
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import messageService, { type Message, type Conversation } from '../../src/services/messageService';
import LoadingState from '../../src/components/LoadingState';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversation();
  }, [id]);

  const loadConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [convData, messagesData] = await Promise.all([
        messageService.getConversation(id),
        messageService.getMessages(id, 1, 50),
      ]);
      
      setConversation(convData);
      setMessages(messagesData.reverse());
      
      // Mark conversation as read
      await messageService.markAsRead(id);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setIsSending(true);
      const sentMessage = await messageService.sendMessage(id, {
        content: newMessage.trim(),
      });
      
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === 'user-me';
    const showDate = index === 0 || 
      formatDate(item.createdAt) !== formatDate(messages[index - 1]?.createdAt);
    
    return (
      <View>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
        <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
          {!isMe && item.senderAvatar && (
            <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
          )}
          <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
            {!isMe && (
              <Text style={styles.senderName}>{item.senderName}</Text>
            )}
            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
              {item.content}
            </Text>
            <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
          </View>
          {isMe && item.readAt && (
            <Ionicons name="checkmark-done" size={16} color={colors.success} style={styles.readIndicator} />
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <LoadingState message="Loading conversation..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadConversation}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: conversation?.title || 'Conversation',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/messages/${id}`)}
              style={styles.headerButton}
            >
              <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  headerButton: {
    padding: spacing.sm,
  },
  messagesList: {
    padding: spacing.md,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  messageText: {
    ...typography.body,
  },
  myMessageText: {
    color: colors.white,
  },
  theirMessageText: {
    color: colors.text,
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  readIndicator: {
    marginLeft: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    ...typography.body,
    color: colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '600',
  },
});

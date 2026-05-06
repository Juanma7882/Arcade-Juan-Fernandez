import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ChatMessageWithUser, ChatSupabaseService } from './services/chat.supabase.service';
import { FormsModule } from '@angular/forms';
import { NgZone } from '@angular/core';
@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {

  private chatService = inject(ChatSupabaseService);
  private zone = inject(NgZone);

  // ✅ SOLO signal
  messages = signal<ChatMessageWithUser[]>([]);

  currentUser = this.chatService.currentUser;

  channel: any;
  loadingMore = false;
  sending = false;
  newMessage = '';

  async ngOnInit() {
    // 🔹 carga inicial
    const initial = await this.chatService.getLastMessages();
    this.messages.set(initial);
    this.scrollToBottom();

    // 🔹 realtime (UNA sola vez)
    this.channel = this.chatService.subscribeToMessages((msg) => {
      this.zone.run(() => {

        console.log("mensaje nuevo aaaaaaaaaa", msg)
        this.messages.update(prev => {
          // evitar duplicados
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        this.scrollToBottom();
      });
    })
  }

  ngOnDestroy() {
    this.chatService.unsubscribe(this.channel);
  }

  // 🔹 cargar más
  async loadMore() {
    if (this.loadingMore || this.messages().length === 0) return;

    this.loadingMore = true;

    const oldest = this.messages()[0].created_at;

    const older = await this.chatService.getOlderMessages(oldest, 10);

    this.messages.update(prev => [...older, ...prev]);

    this.loadingMore = false;
  }

  // 🔹 enviar
  async send() {
    if (this.sending) return;

    const msg = this.newMessage.trim();
    if (!msg) return;

    this.sending = true;

    await this.chatService.sendMessage(msg);

    this.newMessage = '';
    this.sending = false;
  }

  // 🔹 scroll
  scrollToBottom() {
    setTimeout(() => {
      const el = document.getElementById('chat-container');
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
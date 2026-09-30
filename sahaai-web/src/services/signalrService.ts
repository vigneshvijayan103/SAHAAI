import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';

class SignalRService {
  private connection: HubConnection | null = null;
  private currentUserId: string | null = null;
  private currentRequestId: string | null = null;

  public async startConnection(userId: number, requestId?: number): Promise<HubConnection | null> {
    this.currentUserId = userId.toString();
    if (requestId) {
      this.currentRequestId = requestId.toString();
    }

    // Return existing connection if connected
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      await this.joinGroups();
      return this.connection;
    }

    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl('/hubs/request')
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(LogLevel.Warning)
        .build();

      this.connection.onreconnected(async () => {
        console.log('[SignalR] Reconnected. Rejoining groups...');
        await this.joinGroups();
      });
    }

    try {
      if (this.connection.state === HubConnectionState.Disconnected) {
        await this.connection.start();
        console.log('[SignalR] Connected to /hubs/request');
        await this.joinGroups();
      }
      return this.connection;
    } catch (err) {
      console.warn('[SignalR] Connection error:', err);
      return null;
    }
  }

  private async joinGroups() {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) return;

    if (this.currentUserId) {
      try {
        await this.connection.invoke('JoinUserGroup', this.currentUserId);
      } catch (e) {
        console.warn('[SignalR] JoinUserGroup failed:', e);
      }
    }

    if (this.currentRequestId) {
      try {
        await this.connection.invoke('JoinRequestGroup', this.currentRequestId);
      } catch (e) {
        console.warn('[SignalR] JoinRequestGroup failed:', e);
      }
    }
  }

  public on(event: string, callback: (...args: any[]) => void) {
    if (this.connection) {
      this.connection.on(event, callback);
    }
  }

  public off(event: string, callback?: (...args: any[]) => void) {
    if (this.connection) {
      if (callback) {
        this.connection.off(event, callback);
      } else {
        this.connection.off(event);
      }
    }
  }

  public async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('[SignalR] Disconnected.');
      } catch (err) {
        console.warn('[SignalR] Error stopping connection:', err);
      }
    }
  }
}

export const signalRService = new SignalRService();


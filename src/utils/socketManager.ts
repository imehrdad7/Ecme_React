import * as signalR from '@microsoft/signalr';
import appConfig from '@/configs/app.config';

class SocketManager {
    private static instance: SocketManager;
    private connection: signalR.HubConnection | null = null;
    private isConnecting: boolean = false;

    private constructor() {}

    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    public async connect(token: string): Promise<signalR.HubConnection | null> {
        if (!token) return null;

        // اگر از قبل اتصال برقرار است، آن را برمی‌گردانیم
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return this.connection;
        }

        // اگر در حال اتصال است، منتظر می‌مانیم تا تداخل ایجاد نشود
        if (this.isConnecting) return this.connection;

        this.isConnecting = true;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${appConfig.apiPrefix}/hubs/AppHub`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Trace)
            .build();

        // مدیریت وضعیت اتصال مجدد
        this.connection.onreconnecting(() => {
            console.warn("🟡 در حال تلاش برای اتصال مجدد به سوکت مرکزی...");
        });

        this.connection.onreconnected(() => {
            console.log("🟢 اتصال سوکت مرکزی بازیابی شد.");
        });

        this.connection.onclose(() => {
            console.error("🔴 اتصال سوکت مرکزی بسته شد.");
            this.isConnecting = false;
        });

        try {
            await this.connection.start();
            console.log("⚡ اتصال واحد SignalR (AppHub) با موفقیت برقرار شد.");
            this.isConnecting = false;
            return this.connection;
        } catch (error) {
            console.error("خطا در برقراری اتصال سوکت مرکزی:", error);
            this.connection = null;
            this.isConnecting = false;
            return null;
        }
    }

    public getConnection(): signalR.HubConnection | null {
        return this.connection;
    }

    public async disconnect() {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
            this.isConnecting = false;
            console.log("⚪ اتصال سوکت مرکزی به طور کامل قطع شد.");
        }
    }
}

export const socketManager = SocketManager.getInstance();
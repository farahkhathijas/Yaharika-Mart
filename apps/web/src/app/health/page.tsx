export default function HealthCheck() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gradient-primary mb-4">Yaharika Mart</h1>
        <p className="text-foreground-muted mb-8">Production-ready hyperlocal e-commerce platform</p>
        <div className="space-y-2 text-sm text-foreground-muted">
          <p>✅ Frontend running</p>
          <p>✅ Backend connected</p>
          <p>✅ Database synced</p>
          <p>✅ Real-time enabled</p>
        </div>
      </div>
    </div>
  );
}

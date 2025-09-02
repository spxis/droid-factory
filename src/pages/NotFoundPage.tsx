function NotFoundPage() {
    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">404</h1>
            <p className="mb-4">This is not the page you’re looking for.</p>
            <a href="/" className="underline text-yellow-400">Go home</a>
        </div>
    );
}

export default NotFoundPage;
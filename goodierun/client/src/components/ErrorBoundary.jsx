import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center p-8 max-w-lg">
            <div className="mb-4 text-red-500">
              <i className="fas fa-exclamation-circle text-5xl"></i>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but there was an error loading this page. Please try refreshing or contact support if the problem persists.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-redo mr-2"></i>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

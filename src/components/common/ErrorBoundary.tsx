import { SaveLog } from "@/firebase/logs";
import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  errorStack: string;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
 
    // Define a state variable to track whether is an error or not
    this.state = { 
      hasError: false,
      errorMessage: '',
      errorStack: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorMessage: error.message
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // You can use your own error logging service here
    SaveLog({ error: error.message, errorInfo: errorInfo.componentStack ?? '' })
    this.setState({
      errorStack: errorInfo.componentStack ?? ''
    })
  }

  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops, there is an error!</h2>
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Error Message:</h3>
            <p className="text-red-700">{this.state.errorMessage}</p>
          </div>
          {this.state.errorStack && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Component Stack:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{this.state.errorStack}</pre>
            </div>
          )}
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={() => this.setState({ 
              hasError: false,
              errorMessage: '',
              errorStack: ''
            })}
          >
            Try again?
          </button>
        </div>
      )
    }
 
    // Return children components in case of no error
 
    return this.props.children
  }
}
 
export default ErrorBoundary
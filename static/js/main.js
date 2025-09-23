// Main JavaScript file for Score Management System

// Global configuration
const CONFIG = {
  API_BASE_URL: "/api",
  TIMEOUT: 10000,
  MAX_RETRIES: 3,
};

// Utility functions
const Utils = {
  // Show loading spinner
  showLoading: (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove("d-none");
    }
  },

  // Hide loading spinner
  hideLoading: (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add("d-none");
    }
  },

  // Show/hide elements
  showElement: (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove("d-none");
      element.classList.add("fade-in");
    }
  },

  hideElement: (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add("d-none");
    }
  },

  // Display success message
  showSuccess: (message) => {
    const toast = document.createElement("div");
    toast.className =
      "alert alert-success alert-dismissible fade show position-fixed";
    toast.style.cssText =
      "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
    toast.innerHTML = `
            <i class="fas fa-check-circle"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 2000);
  },

  // Display error message
  showError: (message) => {
    const toast = document.createElement("div");
    toast.className =
      "alert alert-danger alert-dismissible fade show position-fixed";
    toast.style.cssText =
      "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
    toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 2000);
  },

  // Format date
  formatDate: (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    // Hiển thị theo UTC/GMT (giống như dữ liệu gốc từ server)
    return date.toLocaleString("vi-VN", {
      timeZone: "GMT",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  },

  // Format score with color coding
  formatScore: (score) => {
    const numScore = parseFloat(score);
    let className = "";

    if (numScore >= 8) className = "text-success fw-bold";
    else if (numScore >= 6.5) className = "text-warning fw-bold";
    else if (numScore >= 5) className = "text-info fw-bold";
    else className = "text-danger fw-bold";

    return `<span class="${className}">${numScore.toFixed(1)}</span>`;
  },

  // Validate JSON
  isValidJSON: (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

// API service
const API = {
  // Generic API call with error handling
  call: async (url, options = {}) => {
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: CONFIG.TIMEOUT,
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  },

  // Get scores by class
  getScoresByClass: async (classId) => {
    return await API.call(
      `${CONFIG.API_BASE_URL}/scores/${encodeURIComponent(classId)}`
    );
  },

  // Batch update scores
  batchUpdateScores: async (changes) => {
    return await API.call(`${CONFIG.API_BASE_URL}/batch-update`, {
      method: "POST",
      body: JSON.stringify({ changes }),
    });
  },
};

// Initialize application
document.addEventListener("DOMContentLoaded", function () {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Add loading animation to forms
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;

        // Re-enable button after 30 seconds (fallback)
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 1000);
      }
    });
  });

  console.log("Score Management System initialized successfully");
});

// Global error handler
window.addEventListener("error", function (e) {
  console.error("Global error:", e.error);
  Utils.showError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
});

// Unhandled promise rejection handler
window.addEventListener("unhandledrejection", function (e) {
  console.error("Unhandled promise rejection:", e.reason);
  Utils.showError("Đã xảy ra lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.");
});

// Export utilities for use in other scripts
window.Utils = Utils;
window.API = API;
window.CONFIG = CONFIG;

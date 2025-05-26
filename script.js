// Local Storage Keys
const USERS_KEY = "hotel_users"
const BOOKINGS_KEY = "hotel_bookings"
const CURRENT_USER_KEY = "current_user"

// Slider Variables
const slideIndex = 1
let slideInterval

// Import Swiper library
const Swiper = window.Swiper

// Initialize data
function initializeData() {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]))
  }
  if (!localStorage.getItem(BOOKINGS_KEY)) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify([]))
  }
}

// User Authentication Functions
function handleSignup(event) {
  event.preventDefault()

  const name = document.getElementById("signupName").value
  const email = document.getElementById("signupEmail").value
  const password = document.getElementById("signupPassword").value

  const users = JSON.parse(localStorage.getItem(USERS_KEY))

  // Check if user already exists
  if (users.find((user) => user.email === email)) {
    showNotification("User already exists with this email!", "error")
    return false
  }

  // Add new user
  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
  }

  users.push(newUser)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))

  showNotification("Account created successfully! Please login.", "success")
  showLogin()
  return false
}

function handleLogin(event) {
  event.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  const users = JSON.parse(localStorage.getItem(USERS_KEY))
  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    showNotification("Login successful!", "success")
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1000)
  } else {
    showNotification("Invalid email or password!", "error")
  }

  return false
}

function logout() {
  localStorage.removeItem(CURRENT_USER_KEY)
  showNotification("Logged out successfully!", "success")
  setTimeout(() => {
    window.location.href = "login.html"
  }, 1000)
}

function showSignup() {
  document.getElementById("loginForm").style.display = "none"
  document.getElementById("signupForm").style.display = "block"
}

function showLogin() {
  document.getElementById("signupForm").style.display = "none"
  document.getElementById("loginForm").style.display = "block"
}

// Booking Functions
function handleBooking(event) {
  event.preventDefault()

  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY))
  if (!currentUser) {
    showNotification("Please login first to book a room!", "error")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 1500)
    return false
  }

  const guestName = document.getElementById("guestName").value
  const email = document.getElementById("email").value
  const phone = document.getElementById("phone").value
  const roomType = document.getElementById("roomType").value
  const checkIn = document.getElementById("checkIn").value
  const checkOut = document.getElementById("checkOut").value
  const guests = document.getElementById("guests").value

  // Validate dates
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (checkInDate < today) {
    showNotification("Check-in date cannot be in the past!", "error")
    return false
  }

  if (checkOutDate <= checkInDate) {
    showNotification("Check-out date must be after check-in date!", "error")
    return false
  }

  const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY))

  const newBooking = {
    id: Date.now(),
    userId: currentUser.id,
    guestName: guestName,
    email: email,
    phone: phone,
    roomType: roomType,
    checkIn: checkIn,
    checkOut: checkOut,
    guests: guests,
    status: "Confirmed",
    bookingDate: new Date().toLocaleDateString(),
  }

  bookings.push(newBooking)
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))

  showNotification("Room booked successfully!", "success")
  setTimeout(() => {
    window.location.href = "my-bookings.html"
  }, 1500)
  return false
}

// Load bookings for current user
function loadBookings() {
  const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY))
  if (!currentUser) {
    showNotification("Please login first!", "error")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 1500)
    return
  }

  const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY))
  const userBookings = bookings.filter((booking) => booking.userId === currentUser.id)

  const tableBody = document.getElementById("bookingsTable")
  tableBody.innerHTML = ""

  if (userBookings.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem;">
          <div style="color: var(--text-secondary);">
            <h3>No bookings found</h3>
            <p>You haven't made any reservations yet.</p>
            <a href="booking.html" class="btn-primary" style="margin-top: 1rem;">Book Your First Room</a>
          </div>
        </td>
      </tr>
    `
    return
  }

  userBookings.forEach((booking) => {
    const row = document.createElement("tr")
    const statusClass = booking.status === "Confirmed" ? "success" : "warning"

    row.innerHTML = `
      <td>#${booking.id}</td>
      <td>${booking.guestName}</td>
      <td>${booking.roomType.split(" - ")[0]}</td>
      <td>${formatDate(booking.checkIn)}</td>
      <td>${formatDate(booking.checkOut)}</td>
      <td>${booking.guests}</td>
      <td><span class="status-badge ${statusClass}">${booking.status}</span></td>
      <td>
        <button class="btn-warning" onclick="openUpdateModal(${booking.id})" title="Edit Booking">✏️</button>
        <button class="btn-danger" onclick="deleteBooking(${booking.id})" title="Cancel Booking">🗑️</button>
      </td>
    `
    tableBody.appendChild(row)
  })
}

// Delete booking
function deleteBooking(bookingId) {
  if (confirm("Are you sure you want to cancel this booking?")) {
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY))
    const updatedBookings = bookings.filter((booking) => booking.id !== bookingId)
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookings))
    loadBookings()
    showNotification("Booking cancelled successfully!", "success")
  }
}

// Update booking functions
function openUpdateModal(bookingId) {
  const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY))
  const booking = bookings.find((b) => b.id === bookingId)

  if (booking) {
    document.getElementById("updateBookingId").value = booking.id
    document.getElementById("updateGuestName").value = booking.guestName
    document.getElementById("updateRoomType").value = booking.roomType
    document.getElementById("updateCheckIn").value = booking.checkIn
    document.getElementById("updateCheckOut").value = booking.checkOut
    document.getElementById("updateGuests").value = booking.guests

    document.getElementById("updateModal").style.display = "flex"
    document.body.style.overflow = "hidden"
  }
}

function closeUpdateModal() {
  document.getElementById("updateModal").style.display = "none"
  document.body.style.overflow = "auto"
}

function updateBooking(event) {
  event.preventDefault()

  const bookingId = Number.parseInt(document.getElementById("updateBookingId").value)
  const guestName = document.getElementById("updateGuestName").value
  const roomType = document.getElementById("updateRoomType").value
  const checkIn = document.getElementById("updateCheckIn").value
  const checkOut = document.getElementById("updateCheckOut").value
  const guests = document.getElementById("updateGuests").value

  // Validate dates
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (checkInDate < today) {
    showNotification("Check-in date cannot be in the past!", "error")
    return false
  }

  if (checkOutDate <= checkInDate) {
    showNotification("Check-out date must be after check-in date!", "error")
    return false
  }

  const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY))
  const bookingIndex = bookings.findIndex((b) => b.id === bookingId)

  if (bookingIndex !== -1) {
    bookings[bookingIndex].guestName = guestName
    bookings[bookingIndex].roomType = roomType
    bookings[bookingIndex].checkIn = checkIn
    bookings[bookingIndex].checkOut = checkOut
    bookings[bookingIndex].guests = guests

    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
    closeUpdateModal()
    loadBookings()
    showNotification("Booking updated successfully!", "success")
  }

  return false
}

// Swiper Initialization
function initializeSwiper() {
  if (document.querySelector(".hero-swiper")) {
    const swiper = new Swiper(".hero-swiper", {
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      speed: 1000,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    })

    // Pause autoplay on hover
    const heroSection = document.querySelector(".hero")
    if (heroSection) {
      heroSection.addEventListener("mouseenter", () => {
        swiper.autoplay.stop()
      })

      heroSection.addEventListener("mouseleave", () => {
        swiper.autoplay.start()
      })
    }
  }
}

// Notification System
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification")
  existingNotifications.forEach((notification) => notification.remove())

  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `

  // Add notification styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-left: 4px solid ${getNotificationColor(type)};
    animation: slideInRight 0.3s ease-out;
    max-width: 400px;
  `

  const content = notification.querySelector(".notification-content")
  content.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
  `

  const icon = notification.querySelector(".notification-icon")
  icon.style.cssText = `
    font-size: 1.2rem;
    color: ${getNotificationColor(type)};
  `

  const messageEl = notification.querySelector(".notification-message")
  messageEl.style.cssText = `
    flex: 1;
    color: var(--text-primary);
    font-weight: 500;
  `

  const closeBtn = notification.querySelector(".notification-close")
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  `

  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "var(--bg-secondary)"
  })

  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "none"
  })

  document.body.appendChild(notification)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = "slideOutRight 0.3s ease-in"
      setTimeout(() => notification.remove(), 300)
    }
  }, 5000)
}

function getNotificationIcon(type) {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  }
  return icons[type] || icons.info
}

function getNotificationColor(type) {
  const colors = {
    success: "#27ae60",
    error: "#e74c3c",
    warning: "#f39c12",
    info: "#3498db",
  }
  return colors[type] || colors.info
}

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Mobile Menu Toggle
function initializeMobileMenu() {
  const mobileToggle = document.querySelector(".mobile-menu-toggle")
  const navMenu = document.querySelector(".nav-menu")

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      mobileToggle.classList.toggle("active")
    })

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll(".nav-menu a")
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active")
        mobileToggle.classList.remove("active")
      })
    })
  }
}

// Smooth Scrolling for Anchor Links
function initializeSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]')
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetId = link.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// Form Validation Enhancement
function enhanceFormValidation() {
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input, select")
    inputs.forEach((input) => {
      input.addEventListener("blur", validateField)
      input.addEventListener("input", clearFieldError)
    })
  })
}

function validateField(event) {
  const field = event.target
  const value = field.value.trim()

  // Remove existing error styling
  field.classList.remove("error")

  // Basic validation
  if (field.hasAttribute("required") && !value) {
    showFieldError(field, "This field is required")
    return false
  }

  if (field.type === "email" && value && !isValidEmail(value)) {
    showFieldError(field, "Please enter a valid email address")
    return false
  }

  if (field.type === "tel" && value && !isValidPhone(value)) {
    showFieldError(field, "Please enter a valid phone number")
    return false
  }

  return true
}

function clearFieldError(event) {
  const field = event.target
  field.classList.remove("error")
  const errorMsg = field.parentElement.querySelector(".field-error")
  if (errorMsg) {
    errorMsg.remove()
  }
}

function showFieldError(field, message) {
  field.classList.add("error")

  // Remove existing error message
  const existingError = field.parentElement.querySelector(".field-error")
  if (existingError) {
    existingError.remove()
  }

  // Add new error message
  const errorDiv = document.createElement("div")
  errorDiv.className = "field-error"
  errorDiv.textContent = message
  errorDiv.style.cssText = `
    color: var(--danger-color);
    font-size: 0.8rem;
    margin-top: 0.25rem;
  `

  field.parentElement.appendChild(errorDiv)
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone) {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

// Add CSS for error states
function addErrorStyles() {
  const style = document.createElement("style")
  style.textContent = `
    .form-group input.error,
    .form-group select.error {
      border-color: var(--danger-color) !important;
      box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1) !important;
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-badge.success {
      background: rgba(39, 174, 96, 0.1);
      color: var(--success-color);
    }
    
    .status-badge.warning {
      background: rgba(243, 156, 18, 0.1);
      color: var(--warning-color);
    }
    
    @media (max-width: 768px) {
      .nav-menu.active {
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: var(--shadow-lg);
        border-top: 1px solid var(--border-color);
      }
      
      .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }
      
      .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
      }
      
      .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
      }
    }
  `
  document.head.appendChild(style)
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initializeData()
  initializeSwiper()
  initializeMobileMenu()
  initializeSmoothScrolling()
  enhanceFormValidation()
  addErrorStyles()

  // Load bookings if on my-bookings page
  if (window.location.pathname.includes("my-bookings.html")) {
    loadBookings()
  }

  // Set minimum date for booking forms
  const today = new Date().toISOString().split("T")[0]
  const checkInInputs = document.querySelectorAll("#checkIn, #updateCheckIn")
  const checkOutInputs = document.querySelectorAll("#checkOut, #updateCheckOut")

  checkInInputs.forEach((input) => {
    if (input) input.min = today
  })

  checkOutInputs.forEach((input) => {
    if (input) input.min = today
  })

  // Auto-update checkout date when checkin changes
  checkInInputs.forEach((input) => {
    if (input) {
      input.addEventListener("change", (e) => {
        const checkInDate = new Date(e.target.value)
        const nextDay = new Date(checkInDate)
        nextDay.setDate(nextDay.getDate() + 1)

        const checkOutInput = document.querySelector(input.id === "checkIn" ? "#checkOut" : "#updateCheckOut")

        if (checkOutInput) {
          checkOutInput.min = nextDay.toISOString().split("T")[0]
          if (checkOutInput.value && new Date(checkOutInput.value) <= checkInDate) {
            checkOutInput.value = nextDay.toISOString().split("T")[0]
          }
        }
      })
    }
  })
})

// Close modal when clicking outside
window.onclick = (event) => {
  const modal = document.getElementById("updateModal")
  if (event.target === modal) {
    closeUpdateModal()
  }
}

// Handle page visibility change (pause slider when tab is not active)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Page is hidden, pause any animations or timers
  } else {
    // Page is visible, resume animations or timers
  }
})

// Keyboard navigation for accessibility
document.addEventListener("keydown", (e) => {
  // Close modal with Escape key
  if (e.key === "Escape") {
    const modal = document.getElementById("updateModal")
    if (modal && modal.style.display === "flex") {
      closeUpdateModal()
    }
  }
})

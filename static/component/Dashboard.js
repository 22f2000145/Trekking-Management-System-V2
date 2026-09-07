export default {
  template: `
    <div class="tk-dashboard tk-fade-in">

      <!-- Toast Notification Container -->
      <div class="tk-toast-container">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="tk-toast"
          :class="'tk-toast-' + toast.type"
        >
          <span>{{ toast.icon }}</span>
          <span style="flex:1;">{{ toast.text }}</span>
          <button class="tk-toast-close" @click="removeToast(toast.id)">✕</button>
        </div>
      </div>

      <!-- Dashboard Header -->
      <div class="tk-dashboard-header">
        <div>
          <div class="tk-dashboard-welcome">
            Welcome back, <span>{{ username }}</span> 👋
          </div>
          <div class="tk-dashboard-subtitle">
            <span v-if="isStaff">🗺️ Guide Command Hub &nbsp;|&nbsp; Manage assigned treks & participants</span>
            <span v-else>🏕️ Trekker Adventure Base &nbsp;|&nbsp; Discover & book mountain journeys</span>
          </div>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <router-link v-if="!isStaff" to="/update" class="tk-btn tk-btn-ghost-green tk-btn-sm">
            👤 Edit Profile
          </router-link>
          <button
            class="tk-btn tk-btn-primary tk-btn-sm"
            @click="exportCSV"
            :disabled="isExporting"
          >
            <span v-if="isExporting" class="tk-spinner" style="margin-right:6px;"></span>
            📥 {{ isExporting ? 'Exporting...' : 'Export CSV' }}
          </button>
        </div>
      </div>

      <!-- ============================================================
           GUIDE / STAFF VIEW
           ============================================================ -->
      <div v-if="isStaff">

        <!-- Guide Stats Strip -->
        <div class="tk-stat-grid tk-section tk-slide-up">
          <div class="tk-stat-card">
            <div class="tk-stat-icon tk-stat-icon-green">🗺️</div>
            <div class="tk-stat-number">{{ treks.length }}</div>
            <div class="tk-stat-label">Assigned Treks</div>
          </div>
          <div class="tk-stat-card">
            <div class="tk-stat-icon tk-stat-icon-gold">👥</div>
            <div class="tk-stat-number">{{ guideTotalTrekkers }}</div>
            <div class="tk-stat-label">Total Trekkers</div>
          </div>
          <div class="tk-stat-card">
            <div class="tk-stat-icon tk-stat-icon-sky">✅</div>
            <div class="tk-stat-number">{{ guideConfirmedTrekkers }}</div>
            <div class="tk-stat-label">Confirmed Trekkers</div>
          </div>
        </div>

        <!-- Assigned Treks -->
        <div class="tk-card tk-section">
          <div class="tk-card-header">
            <h4>🗺️ My Assigned Treks</h4>
            <span class="tk-badge tk-badge-stone">{{ treks.length }} Assigned</span>
          </div>
          <div class="tk-card-body">
            <div class="tk-table-wrapper">
              <table class="tk-table">
                <thead>
                  <tr>
                    <th>Trek Name</th>
                    <th>Location</th>
                    <th>Difficulty</th>
                    <th>Slots</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="trek in treks" :key="trek.id">
                    <td style="font-weight:700;color:var(--text-primary);">{{ trek.name }}</td>
                    <td>📍 {{ trek.location }}</td>
                    <td>
                      <span class="tk-badge"
                        :class="trek.difficulty === 'Easy' ? 'tk-difficulty-easy' : trek.difficulty === 'Moderate' ? 'tk-difficulty-moderate' : 'tk-difficulty-hard'">
                        {{ trek.difficulty }}
                      </span>
                    </td>
                    <td>
                      <span :style="trek.slots < 5 ? 'color:var(--danger);font-weight:700;' : 'color:var(--forest-light);font-weight:600;'">
                        {{ trek.slots }}
                      </span>
                    </td>
                    <td>
                      <span class="tk-badge"
                        :class="trek.status === 'Open' ? 'tk-badge-success' : trek.status === 'Completed' ? 'tk-badge-sky' : 'tk-badge-danger'">
                        {{ trek.status }}
                      </span>
                    </td>
                    <td>
                      <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="tk-btn tk-btn-ghost-green tk-btn-xs" @click="editTrek(trek)">✏️ Update</button>
                        <button class="tk-btn tk-btn-sky tk-btn-xs" @click="loadParticipants(trek.id)">👥 Trekkers</button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="treks.length === 0">
                    <td colspan="6">
                      <div class="tk-empty-state">
                        <div class="tk-empty-state-icon">🗺️</div>
                        <div class="tk-empty-state-title">No treks assigned yet</div>
                        <div class="tk-empty-state-text">Check with the administrator to get assigned to upcoming expeditions.</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Edit Trek Status Panel -->
        <div v-if="editTrekMode" class="tk-card tk-section tk-slide-up">
          <div class="tk-card-header">
            <h4>✏️ Update Trek: {{ trekForm.name }}</h4>
            <button class="tk-btn tk-btn-sm" style="background:rgba(255,255,255,0.15);color:white;border:none;" @click="clearTrekForm">✕</button>
          </div>
          <div class="tk-card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <div class="tk-form-group">
                <label class="tk-label">Available Slots</label>
                <input type="number" class="tk-input" v-model="trekForm.slots">
              </div>
              <div class="tk-form-group">
                <label class="tk-label">Status</label>
                <select class="tk-select" v-model="trekForm.status">
                  <option>Open</option>
                  <option>Closed</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
            <div style="display:flex;gap:10px;">
              <button class="tk-btn tk-btn-primary tk-btn-sm" @click="updateTrek">💾 Save Changes</button>
              <button class="tk-btn tk-btn-ghost-green tk-btn-sm" @click="clearTrekForm">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Trekkers List -->
        <div v-if="viewParticipants" class="tk-card tk-section tk-slide-up">
          <div class="tk-card-header">
            <h4>👥 Trekkers for Trek #{{ selectedTrekId }}</h4>
            <button class="tk-btn tk-btn-sm" style="background:rgba(255,255,255,0.15);color:white;border:none;" @click="viewParticipants = false">✕ Close</button>
          </div>
          <div class="tk-card-body">
            <div class="tk-filter-bar">
              <div class="tk-search-wrapper">
                <span class="tk-search-icon">🔍</span>
                <input type="text" class="tk-input" placeholder="Search trekkers by username, ID or date..." v-model="participantSearch">
              </div>
              <select class="tk-select" style="width:auto;" v-model="participantStatusFilter">
                <option value="">All Booking Status</option>
                <option value="Pending">Pending</option>
                <option value="Booked">Booked</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select class="tk-select" style="width:auto;" v-model="participantPaymentFilter">
                <option value="">All Payment Status</option>
                <option value="Pending">Pending</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div class="tk-table-wrapper">
              <table class="tk-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Trekker</th>
                    <th>Booking Date</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="b in getFilteredBookings()" :key="b.id">
                    <td><span class="tk-badge tk-badge-stone">#{{ b.id }}</span></td>
                    <td style="font-weight:600;">{{ b.username }}</td>
                    <td>{{ b.booking_date }}</td>
                    <td>
                      <span class="tk-badge"
                        :class="b.payment_status === 'Paid' ? 'tk-badge-success' : b.payment_status === 'Pending Verification' ? 'tk-badge-warning' : 'tk-badge-stone'">
                        {{ b.payment_status }}
                      </span>
                    </td>
                    <td>
                      <span class="tk-badge"
                        :class="b.booking_status === 'Booked' ? 'tk-badge-success' : b.booking_status === 'Cancelled' ? 'tk-badge-danger' : 'tk-badge-warning'">
                        {{ b.booking_status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="getFilteredBookings().length === 0">
                    <td colspan="5">
                      <div class="tk-empty-state">
                        <div class="tk-empty-state-icon">👥</div>
                        <div class="tk-empty-state-title">No trekkers found</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Guide Bookings History -->
        <div class="tk-card tk-section">
          <div class="tk-card-header">
            <h4>📋 All Bookings History</h4>
          </div>
          <div class="tk-card-body">
            <div class="tk-filter-bar">
              <div class="tk-search-wrapper">
                <span class="tk-search-icon">🔍</span>
                <input type="text" class="tk-input" placeholder="Search by ID, trek, trekker or date..." v-model="bookingSearch">
              </div>
              <select class="tk-select" style="width:auto;" v-model="bookingStatusFilter">
                <option value="">All Booking Status</option>
                <option value="Pending">Pending</option>
                <option value="Booked">Booked</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select class="tk-select" style="width:auto;" v-model="paymentStatusFilter">
                <option value="">All Payment Status</option>
                <option value="Pending">Pending</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div class="tk-table-wrapper">
              <table class="tk-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Trek Name</th>
                    <th>Trekker</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="b in getFilteredAllBookings()" :key="b.id">
                    <td><span class="tk-badge tk-badge-stone">#{{ b.id }}</span></td>
                    <td style="font-weight:600;">{{ b.trek_name }}</td>
                    <td>{{ b.username }}</td>
                    <td>{{ b.booking_date }}</td>
                    <td style="font-weight:700;color:var(--forest);">₹{{ b.total_amount }}</td>
                    <td>
                      <span class="tk-badge"
                        :class="b.payment_status === 'Paid' ? 'tk-badge-success' : b.payment_status === 'Pending Verification' ? 'tk-badge-warning' : 'tk-badge-stone'">
                        {{ b.payment_status }}
                      </span>
                    </td>
                    <td>
                      <span class="tk-badge"
                        :class="b.booking_status === 'Booked' ? 'tk-badge-success' : b.booking_status === 'Cancelled' ? 'tk-badge-danger' : 'tk-badge-warning'">
                        {{ b.booking_status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="getFilteredAllBookings().length === 0">
                    <td colspan="7">
                      <div class="tk-empty-state">
                        <div class="tk-empty-state-icon">📋</div>
                        <div class="tk-empty-state-title">No bookings found</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           USER / TREKKER VIEW
           ============================================================ -->
      <div v-else>

        <!-- Trekker Quick Stats Strip -->
        <div class="tk-stat-grid tk-section tk-slide-up">
          <div class="tk-stat-card">
            <div class="tk-stat-icon tk-stat-icon-green">🎒</div>
            <div class="tk-stat-number">{{ bookings.length }}</div>
            <div class="tk-stat-label">Total Bookings</div>
          </div>
          <div class="tk-stat-card">
            <div class="tk-stat-icon tk-stat-icon-gold">✅</div>
            <div class="tk-stat-number">{{ userConfirmedBookings }}</div>
            <div class="tk-stat-label">Confirmed Treks</div>
          </div>
          <div class="tk-stat-card">
            <div class="tk-stat-icon tk-stat-icon-sky">⏳</div>
            <div class="tk-stat-number">{{ userPendingBookings }}</div>
            <div class="tk-stat-label">Pending / Verifying</div>
          </div>
          <div class="tk-stat-card">
            <div class="tk-stat-icon tk-stat-icon-earth">💰</div>
            <div class="tk-stat-number">₹{{ userTotalSpent }}</div>
            <div class="tk-stat-label">Total Invested</div>
          </div>
        </div>

        <!-- Available Treks Section -->
        <div class="tk-card tk-section">
          <div class="tk-card-header">
            <div>
              <h4 style="display:flex;align-items:center;gap:8px;">
                ⛰️ Available Treks
                <span class="tk-badge tk-badge-stone" style="font-size:0.75rem;">{{ getFilteredTreks().length }} Treks</span>
              </h4>
            </div>
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
              <!-- View Switcher -->
              <div class="tk-view-toggle">
                <button
                  class="tk-view-btn"
                  :class="{ active: viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                  title="Grid Card View"
                >
                  🔲 Cards
                </button>
                <button
                  class="tk-view-btn"
                  :class="{ active: viewMode === 'table' }"
                  @click="viewMode = 'table'"
                  title="Table Data View"
                >
                  📋 Table
                </button>
              </div>

              <!-- Search & Filters -->
              <div class="tk-search-wrapper" style="min-width:180px;">
                <span class="tk-search-icon">🔍</span>
                <input type="text" class="tk-input" placeholder="Search name / location..." v-model="trekSearch" style="font-size:0.8rem;padding:7px 7px 7px 32px;">
              </div>
              <select class="tk-select" style="width:auto;font-size:0.8rem;padding:7px 28px 7px 10px;" v-model="difficultyFilter">
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
              </select>
              <input type="number" class="tk-input" placeholder="Max days" v-model="durationFilter" style="width:90px;font-size:0.8rem;padding:7px 10px;">
            </div>
          </div>

          <div class="tk-card-body">

            <!-- GRID VIEW -->
            <div v-if="viewMode === 'grid'">
              <div class="tk-trek-grid">
                <div
                  v-for="trek in getFilteredTreks()"
                  :key="trek.id"
                  class="tk-trek-card"
                >
                  <div class="tk-trek-card-media">
                    <span class="tk-trek-card-icon">🏔️</span>
                    <span class="tk-trek-card-badge">
                      <span class="tk-badge"
                        :class="trek.difficulty === 'Easy' ? 'tk-difficulty-easy' : trek.difficulty === 'Moderate' ? 'tk-difficulty-moderate' : 'tk-difficulty-hard'">
                        {{ trek.difficulty }}
                      </span>
                    </span>
                    <div class="tk-trek-card-slots">
                      <span class="tk-pulse" :style="trek.slots < 5 ? 'background:var(--danger);' : 'background:#4ade80;'"></span>
                      {{ trek.slots }} slots
                    </div>
                  </div>

                  <div class="tk-trek-card-body">
                    <h5 class="tk-trek-card-title">{{ trek.name }}</h5>
                    <div class="tk-trek-card-location">📍 {{ trek.location }}</div>
                    <div class="tk-trek-card-desc">{{ trek.description || 'Embark on an unforgettable mountain journey with seasoned trail leaders.' }}</div>

                    <div class="tk-trek-card-meta">
                      <div><strong>⏱️ Duration:</strong> {{ trek.duration }} Days</div>
                      <div><strong>📅 Dates:</strong> {{ trek.start_date }}</div>
                    </div>
                  </div>

                  <div class="tk-trek-card-footer">
                    <div class="tk-trek-card-price">
                      ₹{{ trek.price }} <span>/ person</span>
                    </div>
                    <div style="display:flex;gap:6px;">
                      <button class="tk-btn tk-btn-ghost-green tk-btn-xs" @click="openTrekDetail(trek)">
                        🔍 Details
                      </button>
                      <button
                        class="tk-btn tk-btn-primary tk-btn-xs"
                        @click="openBookingConfirmation(trek)"
                        :disabled="trek.slots <= 0"
                        :style="trek.slots <= 0 ? 'opacity:0.5;cursor:not-allowed;' : ''"
                      >
                        🎒 Book
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="getFilteredTreks().length === 0" class="tk-empty-state" style="margin:2rem 0;">
                <div class="tk-empty-state-icon">⛰️</div>
                <div class="tk-empty-state-title">No treks found</div>
                <div class="tk-empty-state-text">Try adjusting your search criteria or difficulty filters</div>
              </div>
            </div>

            <!-- TABLE VIEW -->
            <div v-else class="tk-table-wrapper">
              <table class="tk-table">
                <thead>
                  <tr>
                    <th>Trek Name</th>
                    <th>Location</th>
                    <th>Difficulty</th>
                    <th>Duration</th>
                    <th>Dates</th>
                    <th>Slots</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="trek in getFilteredTreks()" :key="trek.id">
                    <td style="font-weight:700;color:var(--text-primary);">{{ trek.name }}</td>
                    <td>📍 {{ trek.location }}</td>
                    <td>
                      <span class="tk-badge"
                        :class="trek.difficulty === 'Easy' ? 'tk-difficulty-easy' : trek.difficulty === 'Moderate' ? 'tk-difficulty-moderate' : 'tk-difficulty-hard'">
                        {{ trek.difficulty }}
                      </span>
                    </td>
                    <td>⏱️ {{ trek.duration }} days</td>
                    <td style="font-size:0.8rem;color:var(--text-muted);">{{ trek.start_date }} → {{ trek.end_date }}</td>
                    <td>
                      <span :style="trek.slots < 5 ? 'color:var(--danger);font-weight:700;' : 'color:var(--forest-light);font-weight:600;'">
                        {{ trek.slots }}
                      </span>
                    </td>
                    <td style="font-weight:800;color:var(--forest);font-size:1rem;">₹{{ trek.price }}</td>
                    <td>
                      <div style="display:flex;gap:6px;">
                        <button class="tk-btn tk-btn-ghost-green tk-btn-xs" @click="openTrekDetail(trek)">🔍 Details</button>
                        <button
                          class="tk-btn tk-btn-primary tk-btn-xs"
                          @click="openBookingConfirmation(trek)"
                          :disabled="trek.slots <= 0"
                          :style="trek.slots <= 0 ? 'opacity:0.5;cursor:not-allowed;' : ''"
                        >
                          🎒 Book
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="getFilteredTreks().length === 0">
                    <td colspan="8">
                      <div class="tk-empty-state">
                        <div class="tk-empty-state-icon">⛰️</div>
                        <div class="tk-empty-state-title">No treks found</div>
                        <div class="tk-empty-state-text">Try adjusting your filters</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

        <!-- My Bookings Section -->
        <div class="tk-card tk-section">
          <div class="tk-card-header">
            <h4>🎒 My Bookings & Tickets</h4>
            <span class="tk-badge tk-badge-stone">{{ bookings.length }} Bookings</span>
          </div>
          <div class="tk-card-body">
            <div class="tk-table-wrapper">
              <table class="tk-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Trek Name</th>
                    <th>Booking Date</th>
                    <th>Amount</th>
                    <th>Booking Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="b in bookings" :key="b.id">
                    <td><span class="tk-badge tk-badge-stone">#{{ b.id }}</span></td>
                    <td style="font-weight:700;color:var(--text-primary);">{{ b.trek_name }}</td>
                    <td style="font-size:0.85rem;">{{ b.booking_date }}</td>
                    <td style="font-weight:800;color:var(--forest);">₹{{ b.total_amount }}</td>
                    <td>
                      <span class="tk-badge"
                        :class="b.booking_status === 'Booked' ? 'tk-badge-success' : b.booking_status === 'Cancelled' ? 'tk-badge-danger' : 'tk-badge-warning'">
                        {{ b.booking_status }}
                      </span>
                    </td>
                    <td>
                      <span class="tk-badge"
                        :class="b.payment_status === 'Paid' ? 'tk-badge-success' : b.payment_status === 'Pending Verification' ? 'tk-badge-warning' : 'tk-badge-stone'">
                        {{ b.payment_status }}
                      </span>
                    </td>
                    <td>
                      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                        <!-- E-Ticket Pass Action -->
                        <button class="tk-btn tk-btn-gold tk-btn-xs" @click="openPass(b)">
                          🎫 Ticket
                        </button>

                        <template v-if="b.booking_status === 'Cancelled'">
                          <span class="tk-badge tk-badge-danger" style="font-size:0.75rem;">Cancelled</span>
                        </template>
                        <template v-else>
                          <button
                            v-if="b.payment_status === 'Pending'"
                            class="tk-btn tk-btn-primary tk-btn-xs"
                            @click="payBooking(b.id)"
                            :disabled="actionLoadingId === b.id"
                          >
                            💳 Pay Now
                          </button>
                          <span v-else-if="b.payment_status === 'Pending Verification'" class="tk-badge tk-badge-warning">
                            ⏳ Verifying
                          </span>
                          <span v-else class="tk-badge tk-badge-success">✅ Confirmed</span>

                          <button
                            class="tk-btn tk-btn-danger tk-btn-xs"
                            @click="openCancelConfirmation(b)"
                            :disabled="actionLoadingId === b.id"
                          >
                            ✕ Cancel
                          </button>
                        </template>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="bookings.length === 0">
                    <td colspan="7">
                      <div class="tk-empty-state">
                        <div class="tk-empty-state-icon">🎒</div>
                        <div class="tk-empty-state-title">No bookings yet</div>
                        <div class="tk-empty-state-text">Select your dream trek from above and hit "Book" to begin your journey!</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <!-- ============================================================
           MODALS
           ============================================================ -->

      <!-- 1. TREK DETAIL & ITINERARY MODAL -->
      <div v-if="selectedTrekForDetail" class="tk-modal-overlay" @click.self="selectedTrekForDetail = null">
        <div class="tk-modal-card">
          <div class="tk-modal-header">
            <h3>🏔️ {{ selectedTrekForDetail.name }}</h3>
            <button class="tk-modal-close-btn" @click="selectedTrekForDetail = null">✕</button>
          </div>
          <div class="tk-modal-body">
            <div style="display:flex;gap:8px;margin-bottom:1.25rem;flex-wrap:wrap;">
              <span class="tk-badge"
                :class="selectedTrekForDetail.difficulty === 'Easy' ? 'tk-difficulty-easy' : selectedTrekForDetail.difficulty === 'Moderate' ? 'tk-difficulty-moderate' : 'tk-difficulty-hard'">
                {{ selectedTrekForDetail.difficulty }}
              </span>
              <span class="tk-badge tk-badge-stone">📍 {{ selectedTrekForDetail.location }}</span>
              <span class="tk-badge tk-badge-sky">⏱️ {{ selectedTrekForDetail.duration }} Days</span>
              <span class="tk-badge tk-badge-success">🪑 {{ selectedTrekForDetail.slots }} Slots Remaining</span>
            </div>

            <h5 style="font-weight:700;margin-bottom:6px;color:var(--text-primary);">📖 Expedition Overview</h5>
            <p style="color:var(--text-secondary);font-size:0.95rem;line-height:1.6;margin-bottom:1.5rem;">
              {{ selectedTrekForDetail.description || 'Experience raw wilderness, majestic panoramic mountain crests, and camp under starlit skies. Our certified mountain guides ensure top-tier safety and an unforgettable journey.' }}
            </p>

            <div style="background:var(--snow);padding:1.25rem;border-radius:var(--radius-md);margin-bottom:1.5rem;">
              <h5 style="font-weight:700;margin-bottom:10px;color:var(--forest);">📅 Itinerary & Dates</h5>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.875rem;">
                <div><strong>Start Date:</strong> {{ selectedTrekForDetail.start_date }}</div>
                <div><strong>End Date:</strong> {{ selectedTrekForDetail.end_date }}</div>
                <div><strong>Base Camp:</strong> {{ selectedTrekForDetail.location }}</div>
                <div><strong>Price per trekker:</strong> ₹{{ selectedTrekForDetail.price }}</div>
              </div>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;">
              <div>
                <span style="font-size:0.8rem;color:var(--text-muted);display:block;">Total Cost</span>
                <span style="font-size:1.6rem;font-weight:800;color:var(--forest);">₹{{ selectedTrekForDetail.price }}</span>
              </div>
              <button
                v-if="!isStaff"
                class="tk-btn tk-btn-primary"
                @click="openBookingConfirmation(selectedTrekForDetail)"
                :disabled="selectedTrekForDetail.slots <= 0"
              >
                🎒 Book This Trek
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. BOOKING CONFIRMATION MODAL -->
      <div v-if="bookingCandidate" class="tk-modal-overlay" @click.self="bookingCandidate = null">
        <div class="tk-modal-card" style="max-width:480px;">
          <div class="tk-modal-header">
            <h3>🎒 Confirm Expedition Booking</h3>
            <button class="tk-modal-close-btn" @click="bookingCandidate = null">✕</button>
          </div>
          <div class="tk-modal-body">
            <p style="font-size:0.95rem;color:var(--text-secondary);margin-bottom:1.25rem;">
              You are about to book the following adventure:
            </p>
            <div style="background:var(--snow);padding:1.25rem;border-radius:var(--radius-md);margin-bottom:1.25rem;">
              <h4 style="font-size:1.2rem;color:var(--forest);font-weight:700;margin-bottom:6px;">
                {{ bookingCandidate.name }}
              </h4>
              <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:10px;">
                📍 {{ bookingCandidate.location }} &nbsp;|&nbsp; ⏱️ {{ bookingCandidate.duration }} Days
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border);padding-top:10px;">
                <span style="font-weight:600;">Total Payable:</span>
                <span style="font-size:1.3rem;font-weight:800;color:var(--forest);">₹{{ bookingCandidate.price }}</span>
              </div>
            </div>
            <div class="tk-alert tk-alert-warning" style="font-size:0.8rem;margin-bottom:0;">
              ℹ️ Your booking will start in 'Pending' status. You can pay immediately or from your dashboard.
            </div>
          </div>
          <div class="tk-modal-footer">
            <button class="tk-btn tk-btn-ghost-green" @click="bookingCandidate = null">Cancel</button>
            <button class="tk-btn tk-btn-primary" @click="confirmBooking" :disabled="isSubmittingAction">
              <span v-if="isSubmittingAction" class="tk-spinner" style="margin-right:6px;"></span>
              {{ isSubmittingAction ? 'Booking...' : 'Confirm & Reserve Slot' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 3. CANCELLATION CONFIRMATION MODAL -->
      <div v-if="cancellationCandidate" class="tk-modal-overlay" @click.self="cancellationCandidate = null">
        <div class="tk-modal-card" style="max-width:440px;">
          <div class="tk-modal-header" style="background:linear-gradient(135deg, #7f1d1d, #b91c1c);">
            <h3>⚠️ Cancel Booking?</h3>
            <button class="tk-modal-close-btn" @click="cancellationCandidate = null">✕</button>
          </div>
          <div class="tk-modal-body">
            <p style="font-size:0.95rem;color:var(--text-primary);margin-bottom:1rem;">
              Are you sure you want to cancel booking <strong>#{{ cancellationCandidate.id }}</strong> for
              <strong>{{ cancellationCandidate.trek_name }}</strong>?
            </p>
            <p style="font-size:0.85rem;color:var(--danger);line-height:1.5;">
              Your slot will be immediately released to other waiting trekkers.
            </p>
          </div>
          <div class="tk-modal-footer">
            <button class="tk-btn tk-btn-ghost-green" @click="cancellationCandidate = null">Keep Booking</button>
            <button class="tk-btn tk-btn-danger" @click="confirmCancellation" :disabled="isSubmittingAction">
              <span v-if="isSubmittingAction" class="tk-spinner" style="margin-right:6px;"></span>
              {{ isSubmittingAction ? 'Cancelling...' : 'Yes, Cancel' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 4. DIGITAL TREK E-PASS / TICKET MODAL -->
      <div v-if="selectedBookingForPass" class="tk-modal-overlay" @click.self="selectedBookingForPass = null">
        <div class="tk-modal-card" style="max-width:520px;padding:0;overflow:hidden;">
          <div class="tk-pass-card">
            <!-- Ticket Header -->
            <div class="tk-pass-header">
              <span class="tk-pass-badge">Official Trek Boarding Pass</span>
              <div class="tk-pass-trek-name">{{ selectedBookingForPass.trek_name }}</div>
              <div style="font-size:0.85rem;opacity:0.85;margin-top:4px;">Booking Reference #TK-{{ selectedBookingForPass.id }}</div>
            </div>

            <!-- Perforation Line -->
            <div class="tk-pass-perforation">
              <div class="tk-pass-cutout-left"></div>
              <div class="tk-pass-line"></div>
              <div class="tk-pass-cutout-right"></div>
            </div>

            <!-- Ticket Body -->
            <div class="tk-pass-body">
              <div class="tk-pass-grid">
                <div>
                  <div class="tk-pass-item-label">Trekker Name</div>
                  <div class="tk-pass-item-value">{{ username }}</div>
                </div>
                <div>
                  <div class="tk-pass-item-label">Booking Date</div>
                  <div class="tk-pass-item-value">{{ selectedBookingForPass.booking_date }}</div>
                </div>
                <div>
                  <div class="tk-pass-item-label">Booking Status</div>
                  <div class="tk-pass-item-value">
                    <span class="tk-badge"
                      :class="selectedBookingForPass.booking_status === 'Booked' ? 'tk-badge-success' : selectedBookingForPass.booking_status === 'Cancelled' ? 'tk-badge-danger' : 'tk-badge-warning'">
                      {{ selectedBookingForPass.booking_status }}
                    </span>
                  </div>
                </div>
                <div>
                  <div class="tk-pass-item-label">Payment Status</div>
                  <div class="tk-pass-item-value">
                    <span class="tk-badge"
                      :class="selectedBookingForPass.payment_status === 'Paid' ? 'tk-badge-success' : 'tk-badge-warning'">
                      {{ selectedBookingForPass.payment_status }}
                    </span>
                  </div>
                </div>
                <div>
                  <div class="tk-pass-item-label">Total Fare</div>
                  <div class="tk-pass-item-value" style="color:var(--forest);font-size:1.2rem;">
                    ₹{{ selectedBookingForPass.total_amount }}
                  </div>
                </div>
                <div>
                  <div class="tk-pass-item-label">Lead Guide</div>
                  <div class="tk-pass-item-value">{{ selectedBookingForPass.guide_name || 'Assigned on arrival' }}</div>
                </div>
              </div>

              <!-- Adventure Essentials Notice -->
              <div style="background:var(--snow);padding:10px 14px;border-radius:var(--radius-sm);font-size:0.78rem;color:var(--text-secondary);line-height:1.4;">
                📌 <strong>Checklist:</strong> Carry a valid Government Photo ID, high-ankle trekking shoes, thermal layers, and your personal medication.
              </div>
            </div>

            <!-- Ticket Footer -->
            <div class="tk-pass-footer">
              <button class="tk-btn tk-btn-ghost-green tk-btn-sm" @click="selectedBookingForPass = null">Close</button>
              <button class="tk-btn tk-btn-gold tk-btn-sm" @click="printTicket">🖨️ Print Ticket</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  data() {
    return {
      username: localStorage.getItem("username") || "Trekker",
      role: localStorage.getItem("role") || "",
      toasts: [],
      treks: [],
      bookings: [],
      viewMode: "grid", // 'grid' | 'table'
      trekSearch: "",
      difficultyFilter: "",
      durationFilter: "",
      isExporting: false,
      isSubmittingAction: false,
      actionLoadingId: null,
      editTrekMode: false,
      trekForm: { id: "", name: "", slots: "", status: "Open" },
      viewParticipants: false,
      selectedTrekId: "",
      bookingSearch: "",
      bookingStatusFilter: "",
      paymentStatusFilter: "",
      participantSearch: "",
      participantStatusFilter: "",
      participantPaymentFilter: "",
      // Modals
      selectedTrekForDetail: null,
      bookingCandidate: null,
      cancellationCandidate: null,
      selectedBookingForPass: null
    }
  },
  computed: {
    isStaff() {
      return this.role && this.role.includes("staff")
    },
    userConfirmedBookings() {
      return this.bookings.filter(b => b.booking_status === "Booked").length
    },
    userPendingBookings() {
      return this.bookings.filter(b => b.booking_status === "Pending" || b.booking_status === "Pending Verification").length
    },
    userTotalSpent() {
      return this.bookings
        .filter(b => b.booking_status !== "Cancelled")
        .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0)
    },
    guideTotalTrekkers() {
      return this.bookings.length
    },
    guideConfirmedTrekkers() {
      return this.bookings.filter(b => b.booking_status === "Booked").length
    }
  },
  mounted() {
    this.loadTreks()
    this.loadBookings()
  },
  methods: {
    showToast(text, type = "success") {
      const id = Date.now() + Math.random()
      const icons = {
        success: "✅",
        error: "⚠️",
        warning: "🔔",
        info: "ℹ️"
      }
      this.toasts.push({ id, text, type, icon: icons[type] || "✅" })
      setTimeout(() => {
        this.removeToast(id)
      }, 3500)
    },
    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },
    getFilteredTreks() {
      return this.treks.filter(t => {
        const matchSearch = !this.trekSearch ||
          (t.name && t.name.toLowerCase().includes(this.trekSearch.toLowerCase())) ||
          (t.location && t.location.toLowerCase().includes(this.trekSearch.toLowerCase()))
        const matchDifficulty = !this.difficultyFilter || t.difficulty === this.difficultyFilter
        const matchDuration = !this.durationFilter || parseInt(t.duration) <= parseInt(this.durationFilter)
        return matchSearch && matchDifficulty && matchDuration
      })
    },
    getFilteredBookings() {
      if (!this.selectedTrekId) return []
      var result = []
      var search = this.participantSearch.trim().toLowerCase()
      for (var i = 0; i < this.bookings.length; i++) {
        var b = this.bookings[i]
        if (b.trek_id !== this.selectedTrekId) continue
        if (this.participantStatusFilter && b.booking_status !== this.participantStatusFilter) continue
        if (this.participantPaymentFilter && b.payment_status !== this.participantPaymentFilter) continue
        if (search) {
          var found = false
          if (String(b.id).includes(search)) found = true
          if (b.username && b.username.toLowerCase().includes(search)) found = true
          if (b.booking_date && b.booking_date.toLowerCase().includes(search)) found = true
          if (!found) continue
        }
        result.push(b)
      }
      return result
    },
    getFilteredAllBookings() {
      var result = []
      var search = this.bookingSearch.trim().toLowerCase()
      for (var i = 0; i < this.bookings.length; i++) {
        var b = this.bookings[i]
        var matchesSearch = true
        if (search) {
          var idStr = b.id ? b.id.toString() : ""
          var trekName = b.trek_name ? b.trek_name.toLowerCase() : ""
          var trekkerName = b.username ? b.username.toLowerCase() : ""
          var bookingDate = b.booking_date ? b.booking_date.toLowerCase() : ""
          if (!idStr.includes(search) && !trekName.includes(search) && !trekkerName.includes(search) && !bookingDate.includes(search)) {
            matchesSearch = false
          }
        }
        var matchesBookingStatus = !this.bookingStatusFilter || b.booking_status === this.bookingStatusFilter
        var matchesPaymentStatus = !this.paymentStatusFilter || b.payment_status === this.paymentStatusFilter
        if (matchesSearch && matchesBookingStatus && matchesPaymentStatus) result.push(b)
      }
      return result
    },
    loadTreks() {
      fetch('/api/treks', {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") }
      })
        .then(r => r.json())
        .then(data => {
          this.treks = data.message ? [] : data
        })
        .catch(() => {
          this.treks = []
        })
    },
    loadBookings() {
      fetch('/api/bookings', {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") }
      })
        .then(r => r.json())
        .then(data => {
          this.bookings = data.message ? [] : data
        })
        .catch(() => {
          this.bookings = []
        })
    },
    openTrekDetail(trek) {
      this.selectedTrekForDetail = trek
    },
    openBookingConfirmation(trek) {
      this.selectedTrekForDetail = null
      this.bookingCandidate = trek
    },
    confirmBooking() {
      if (!this.bookingCandidate) return
      this.isSubmittingAction = true
      const trek = this.bookingCandidate

      fetch('/api/bookings/create', {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") },
        body: JSON.stringify({
          trek_id: trek.id,
          total_amount: trek.price,
          payment_status: "Pending",
          booking_status: "Pending"
        })
      })
        .then(r => r.json())
        .then(data => {
          this.bookingCandidate = null
          if (data.message && data.message.includes("successfully")) {
            this.showToast(data.message, "success")
          } else {
            this.showToast(data.message || "Failed to book trek", "error")
          }
          this.loadTreks()
          this.loadBookings()
        })
        .catch(() => {
          this.showToast("Network error while booking trek", "error")
        })
        .finally(() => {
          this.isSubmittingAction = false
        })
    },
    payBooking(bookingId) {
      this.actionLoadingId = bookingId
      fetch('/api/bookings/update/' + bookingId, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") },
        body: JSON.stringify({ payment_status: "Paid", booking_status: "Booked" })
      })
        .then(r => r.json())
        .then(data => {
          this.showToast(data.message || "Payment submitted for verification", "success")
          this.loadBookings()
          this.loadTreks()
        })
        .catch(() => {
          this.showToast("Failed to process payment", "error")
        })
        .finally(() => {
          this.actionLoadingId = null
        })
    },
    openCancelConfirmation(booking) {
      this.cancellationCandidate = booking
    },
    confirmCancellation() {
      if (!this.cancellationCandidate) return
      this.isSubmittingAction = true
      const id = this.cancellationCandidate.id

      fetch('/api/bookings/update/' + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") },
        body: JSON.stringify({ booking_status: "Cancelled" })
      })
        .then(r => r.json())
        .then(data => {
          this.cancellationCandidate = null
          this.showToast(data.message || "Booking cancelled", "success")
          this.loadBookings()
          this.loadTreks()
        })
        .catch(() => {
          this.showToast("Failed to cancel booking", "error")
        })
        .finally(() => {
          this.isSubmittingAction = false
        })
    },
    openPass(booking) {
      this.selectedBookingForPass = booking
    },
    printTicket() {
      window.print()
    },
    editTrek(trek) {
      this.editTrekMode = true
      this.trekForm.id = trek.id
      this.trekForm.name = trek.name
      this.trekForm.slots = trek.slots
      this.trekForm.status = trek.status
    },
    clearTrekForm() {
      this.editTrekMode = false
      this.trekForm = { id: "", name: "", slots: "", status: "Open" }
    },
    updateTrek() {
      fetch('/api/treks/update/' + this.trekForm.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") },
        body: JSON.stringify(this.trekForm)
      })
        .then(r => r.json())
        .then(data => {
          this.showToast(data.message || "Trek updated", "success")
          this.clearTrekForm()
          this.loadTreks()
        })
        .catch(() => {
          this.showToast("Failed to update trek", "error")
        })
    },
    loadParticipants(trekId) {
      this.selectedTrekId = trekId
      this.viewParticipants = true
      this.loadBookings()
    },
    // Authenticated Blob CSV Export
    exportCSV() {
      this.isExporting = true
      this.showToast("Generating CSV report...", "info")

      fetch('/api/export', {
        method: "GET",
        headers: {
          "Authentication-Token": localStorage.getItem("auth-token")
        }
      })
        .then(res => {
          if (!res.ok) throw new Error("Export failed with status " + res.status)
          return res.blob()
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `trek_report_${Date.now()}.csv`
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.URL.revokeObjectURL(url)
          this.showToast("CSV report downloaded successfully!", "success")
        })
        .catch(err => {
          this.showToast("Failed to export CSV. Please ensure Celery worker is running.", "error")
        })
        .finally(() => {
          this.isExporting = false
        })
    }
  }
}
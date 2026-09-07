export default {
  template: `
    <div class="tk-dashboard tk-fade-in">

      <!-- Toast Container -->
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

      <!-- Admin Header -->
      <div class="tk-dashboard-header">
        <div>
          <div class="tk-dashboard-welcome">
            🛡️ Admin <span>Command Center</span>
          </div>
          <div class="tk-dashboard-subtitle">Executive analytics · Expedition inventory · Bookings · Trekkers · Guides</div>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <button class="tk-btn tk-btn-gold tk-btn-sm" @click="exportCSV" :disabled="isExporting">
            <span v-if="isExporting" class="tk-spinner" style="margin-right:6px;"></span>
            📥 {{ isExporting ? 'Exporting...' : 'Export Platform CSV' }}
          </button>
        </div>
      </div>

      <!-- Main Tabs -->
      <div class="tk-tabs">
        <button class="tk-tab" :class="{active: currentTab === 'stats'}" @click="setTab('stats')">
          📈 Analytics & Charts
        </button>
        <button class="tk-tab" :class="{active: currentTab === 'treks'}" @click="setTab('treks')">
          ⛰️ All Treks ({{ treks.length }})
        </button>
        <button class="tk-tab" :class="{active: currentTab === 'bookings'}" @click="setTab('bookings')">
          🎒 Bookings ({{ bookings.length }})
        </button>
        <button class="tk-tab" :class="{active: currentTab === 'users'}" @click="setTab('users')">
          👤 Trekkers ({{ regularUsers.length }})
        </button>
        <button class="tk-tab" :class="{active: currentTab === 'staff'}" @click="setTab('staff')">
          🧭 Guides ({{ staffUsers.length }})
        </button>
        <button class="tk-tab" :class="{active: currentTab === 'create'}" @click="setTab('create')">
          {{ editMode ? '✏️ Edit Trek' : '➕ Create Trek' }}
        </button>
        <button class="tk-tab" :class="{active: currentTab === 'createstaff'}" @click="setTab('createstaff')">
          ➕ Add Guide
        </button>
      </div>

      <!-- ============================================================
           TAB 1: GRAPHICAL ANALYTICAL DASHBOARD
           ============================================================ -->
      <div v-if="currentTab === 'stats'" class="tk-section tk-slide-up">
        
        <!-- Analytics Toolbar -->
        <div class="tk-analytics-toolbar">
          <div class="tk-analytics-title">
            <span>📈 Platform Analytics & Business Insights</span>
            <span class="tk-badge tk-badge-success" style="font-size:0.7rem;">Live Data</span>
          </div>
          <div class="tk-analytics-actions">
            <div style="display:flex;gap:6px;align-items:center;">
              <span style="font-size:0.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Timeframe:</span>
              <button 
                class="tk-timeframe-btn" 
                :class="{active: analyticsTimeframe === 'all'}" 
                @click="setTimeframe('all')">
                All Time
              </button>
              <button 
                class="tk-timeframe-btn" 
                :class="{active: analyticsTimeframe === '6m'}" 
                @click="setTimeframe('6m')">
                Last 6 Months
              </button>
              <button 
                class="tk-timeframe-btn" 
                :class="{active: analyticsTimeframe === '30d'}" 
                @click="setTimeframe('30d')">
                Last 30 Days
              </button>
            </div>
            <button class="tk-btn tk-btn-ghost-green tk-btn-sm" @click="loadAnalytics" :disabled="isLoadingAnalytics">
              <span v-if="isLoadingAnalytics" class="tk-spinner tk-spinner-dark" style="margin-right:6px;"></span>
              🔄 {{ isLoadingAnalytics ? 'Refreshing...' : 'Refresh Data' }}
            </button>
          </div>
        </div>

        <!-- 6 Core KPI Cards -->
        <div class="tk-kpi-grid">
          <!-- Total Revenue -->
          <div class="tk-kpi-card tk-kpi-card-green">
            <div class="tk-kpi-header">
              <span class="tk-kpi-title">Total Realized Revenue</span>
              <div class="tk-kpi-icon" style="background:rgba(61,122,82,0.12);color:var(--forest-light);">💰</div>
            </div>
            <div class="tk-kpi-val" style="color:var(--forest);">₹{{ formatNumber(analytics.kpis.total_revenue) }}</div>
            <div class="tk-kpi-footer">
              <span style="color:var(--forest-light);font-weight:700;">{{ analytics.kpis.confirmed_bookings }}</span> confirmed paid orders
            </div>
          </div>

          <!-- Pending Revenue -->
          <div class="tk-kpi-card tk-kpi-card-gold">
            <div class="tk-kpi-header">
              <span class="tk-kpi-title">Pipeline / Pending</span>
              <div class="tk-kpi-icon" style="background:rgba(212,168,85,0.15);color:#a0742a;">⏳</div>
            </div>
            <div class="tk-kpi-val" style="color:#b45309;">₹{{ formatNumber(analytics.kpis.pending_revenue) }}</div>
            <div class="tk-kpi-footer">
              <span style="color:#b45309;font-weight:700;">{{ analytics.kpis.pending_bookings + analytics.kpis.verification_bookings }}</span> pending verification/payment
            </div>
          </div>

          <!-- Conversion Rate -->
          <div class="tk-kpi-card tk-kpi-card-sky">
            <div class="tk-kpi-header">
              <span class="tk-kpi-title">Booking Conversion</span>
              <div class="tk-kpi-icon" style="background:rgba(74,144,184,0.12);color:var(--sky);">🎯</div>
            </div>
            <div class="tk-kpi-val" style="color:var(--sky);">{{ analytics.kpis.conversion_rate }}%</div>
            <div class="tk-progress-bar-bg">
              <div class="tk-progress-bar-fill" :style="{width: Math.min(analytics.kpis.conversion_rate, 100) + '%'}"></div>
            </div>
            <div class="tk-kpi-footer" style="margin-top:6px;">
              Avg Order Value: <strong>₹{{ formatNumber(analytics.kpis.avg_booking_value) }}</strong>
            </div>
          </div>

          <!-- Occupancy Rate -->
          <div class="tk-kpi-card tk-kpi-card-earth">
            <div class="tk-kpi-header">
              <span class="tk-kpi-title">Slot Occupancy Rate</span>
              <div class="tk-kpi-icon" style="background:rgba(139,94,60,0.12);color:var(--earth);">🏔️</div>
            </div>
            <div class="tk-kpi-val" style="color:var(--earth);">{{ analytics.kpis.overall_occupancy_rate }}%</div>
            <div class="tk-progress-bar-bg">
              <div class="tk-progress-bar-fill" style="background:linear-gradient(90deg, var(--earth), var(--earth-light));" :style="{width: Math.min(analytics.kpis.overall_occupancy_rate, 100) + '%'}"></div>
            </div>
            <div class="tk-kpi-footer" style="margin-top:6px;">
              <strong>{{ analytics.kpis.total_slots_booked }}</strong> / {{ analytics.kpis.total_slots_capacity }} slots filled
            </div>
          </div>

          <!-- Total Trekkers -->
          <div class="tk-kpi-card tk-kpi-card-purple">
            <div class="tk-kpi-header">
              <span class="tk-kpi-title">Platform Trekkers</span>
              <div class="tk-kpi-icon" style="background:rgba(124,58,237,0.12);color:#7c3aed;">👤</div>
            </div>
            <div class="tk-kpi-val" style="color:#6d28d9;">{{ analytics.kpis.total_users }}</div>
            <div class="tk-kpi-footer">
              <span class="tk-badge tk-badge-success" style="padding:2px 8px;font-size:0.7rem;">{{ analytics.kpis.active_users }} Active</span>
              <span v-if="analytics.kpis.inactive_users > 0" class="tk-badge tk-badge-danger" style="padding:2px 8px;font-size:0.7rem;">{{ analytics.kpis.inactive_users }} Inactive</span>
            </div>
          </div>

          <!-- Certified Guides -->
          <div class="tk-kpi-card tk-kpi-card-gold">
            <div class="tk-kpi-header">
              <span class="tk-kpi-title">Certified Guides</span>
              <div class="tk-kpi-icon" style="background:rgba(212,168,85,0.15);color:#d4a855;">🧭</div>
            </div>
            <div class="tk-kpi-val" style="color:var(--forest);">{{ analytics.kpis.total_staff }}</div>
            <div class="tk-kpi-footer">
              <span class="tk-badge tk-badge-sky" style="padding:2px 8px;font-size:0.7rem;">{{ analytics.kpis.active_guides }} Active Guides</span>
              <span v-if="analytics.kpis.inactive_guides > 0" class="tk-badge tk-badge-stone" style="padding:2px 8px;font-size:0.7rem;">{{ analytics.kpis.inactive_guides }} Pending</span>
            </div>
          </div>
        </div>

        <!-- 6 Graphical Charts Grid -->
        <div class="tk-charts-grid">
          
          <!-- Chart 1: Revenue & Bookings Trend -->
          <div class="tk-chart-card">
            <div class="tk-chart-header">
              <div>
                <div class="tk-chart-title">📊 Revenue & Bookings Trend</div>
                <div class="tk-chart-subtitle">Monthly breakdown of realized revenue (₹) vs booking volume</div>
              </div>
              <span class="tk-badge tk-badge-success">Timeline</span>
            </div>
            <div class="tk-chart-container tk-chart-container-tall">
              <canvas id="revenueTrendChart"></canvas>
            </div>
          </div>

          <!-- Chart 2: Booking Status Distribution -->
          <div class="tk-chart-card">
            <div class="tk-chart-header">
              <div>
                <div class="tk-chart-title">🎒 Booking Status Breakdown</div>
                <div class="tk-chart-subtitle">Proportion of confirmed, pending, and cancelled bookings</div>
              </div>
              <span class="tk-badge tk-badge-stone">{{ analytics.kpis.total_bookings }} Total</span>
            </div>
            <div class="tk-chart-container tk-chart-container-tall">
              <canvas id="bookingStatusChart"></canvas>
            </div>
          </div>

          <!-- Chart 3: Trek Difficulty Distribution -->
          <div class="tk-chart-card">
            <div class="tk-chart-header">
              <div>
                <div class="tk-chart-title">⛰️ Treks by Difficulty Level</div>
                <div class="tk-chart-subtitle">Expedition inventory distribution across terrains</div>
              </div>
              <span class="tk-badge tk-badge-sky">{{ analytics.kpis.total_treks }} Expeditions</span>
            </div>
            <div class="tk-chart-container">
              <canvas id="difficultyChart"></canvas>
            </div>
          </div>

          <!-- Chart 4: Top Treks by Revenue -->
          <div class="tk-chart-card">
            <div class="tk-chart-header">
              <div>
                <div class="tk-chart-title">🏆 Top Performing Treks</div>
                <div class="tk-chart-subtitle">Highest grossing expeditions on the platform</div>
              </div>
              <span class="tk-badge tk-badge-gold">Leaderboard</span>
            </div>
            <div class="tk-chart-container">
              <canvas id="topTreksChart"></canvas>
            </div>
          </div>

          <!-- Chart 5: Trek Capacity & Slot Utilization -->
          <div class="tk-chart-card">
            <div class="tk-chart-header">
              <div>
                <div class="tk-chart-title">🎯 Trek Capacity & Slot Utilization</div>
                <div class="tk-chart-subtitle">Booked slots vs available capacity per expedition</div>
              </div>
              <span class="tk-badge tk-badge-stone">Capacity</span>
            </div>
            <div class="tk-chart-container">
              <canvas id="slotCapacityChart"></canvas>
            </div>
          </div>

          <!-- Chart 6: Guide Workload & Trekkers Guided -->
          <div class="tk-chart-card">
            <div class="tk-chart-header">
              <div>
                <div class="tk-chart-title">🧭 Guide Leadership & Assignments</div>
                <div class="tk-chart-subtitle">Expeditions assigned and total participants guided</div>
              </div>
              <span class="tk-badge tk-badge-sky">{{ analytics.guides.length }} Guides</span>
            </div>
            <div class="tk-chart-container">
              <canvas id="guideWorkloadChart"></canvas>
            </div>
          </div>

        </div>

        <!-- Trek Capacity & Performance Summary Table -->
        <div class="tk-card">
          <div class="tk-card-header">
            <h4>📋 Detailed Expedition Utilization & Revenue Breakdown</h4>
            <span class="tk-badge tk-badge-stone">{{ analytics.all_treks_utilization.length }} Treks Listed</span>
          </div>
          <div class="tk-card-body">
            <div class="tk-table-wrapper">
              <table class="tk-table">
                <thead>
                  <tr>
                    <th>Trek Name</th>
                    <th>Location</th>
                    <th>Difficulty</th>
                    <th>Price</th>
                    <th>Guide</th>
                    <th>Booked / Total Slots</th>
                    <th>Occupancy</th>
                    <th>Realized Revenue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in analytics.all_treks_utilization" :key="item.id">
                    <td style="font-weight:700;color:var(--text-primary);">{{ item.name }}</td>
                    <td>📍 {{ item.location }}</td>
                    <td>
                      <span class="tk-badge"
                        :class="item.difficulty === 'Easy' ? 'tk-difficulty-easy' : item.difficulty === 'Moderate' ? 'tk-difficulty-moderate' : 'tk-difficulty-hard'">
                        {{ item.difficulty }}
                      </span>
                    </td>
                    <td style="font-weight:700;">₹{{ formatNumber(item.price) }}</td>
                    <td>🧭 {{ item.guide_name }}</td>
                    <td>
                      <strong>{{ item.slots_booked }}</strong> / {{ item.total_capacity }}
                      <span style="font-size:0.75rem;color:var(--text-muted);display:block;">
                        ({{ item.slots_available }} available)
                      </span>
                    </td>
                    <td style="min-width:130px;">
                      <div style="display:flex;justify-content:space-between;font-size:0.78rem;font-weight:700;margin-bottom:2px;">
                        <span>{{ item.occupancy_rate }}%</span>
                      </div>
                      <div class="tk-progress-bar-bg" style="margin-top:0;">
                        <div class="tk-progress-bar-fill" :style="{width: Math.min(item.occupancy_rate, 100) + '%'}"></div>
                      </div>
                    </td>
                    <td style="font-weight:800;color:var(--forest);">₹{{ formatNumber(item.revenue) }}</td>
                    <td>
                      <span class="tk-badge"
                        :class="item.status === 'Open' ? 'tk-badge-success' : item.status === 'Completed' ? 'tk-badge-sky' : 'tk-badge-danger'">
                        {{ item.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="analytics.all_treks_utilization.length === 0">
                    <td colspan="9">
                      <div class="tk-empty-state">
                        <div class="tk-empty-state-icon">⛰️</div>
                        <div class="tk-empty-state-title">No expedition data available yet</div>
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
           TAB 2: BIFURCATED - TREKKERS & USERS
           ============================================================ -->
      <div v-if="currentTab === 'users'" class="tk-card tk-section tk-slide-up">
        <div class="tk-card-header">
          <div>
            <h4>👤 Registered Trekkers & Platform Users</h4>
            <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);margin-top:2px;">
              Manage trekker accounts, view status, and toggle access permissions
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="tk-btn tk-btn-xs" style="background:rgba(255,255,255,0.2);color:white;" @click="setTab('staff')">
              🧭 Switch to Guides Table →
            </button>
          </div>
        </div>

        <div class="tk-card-body">
          <!-- Filter & Search Bar for Users -->
          <div class="tk-filter-bar">
            <div class="tk-filter-search-group">
              <span class="tk-search-icon">🔍</span>
              <input
                type="text"
                class="tk-input"
                placeholder="Search by username, email, or trekker ID..."
                v-model="userSearch"
                style="font-size:0.85rem;"
              >
              <button v-if="userSearch" class="tk-btn tk-btn-ghost-green tk-btn-xs" @click="userSearch = ''">✕ Clear</button>
            </div>

            <div class="tk-filter-select-group">
              <span style="font-size:0.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Status:</span>
              <select class="tk-select" v-model="userStatusFilter" style="font-size:0.85rem;padding:7px 32px 7px 12px;width:auto;">
                <option value="">All Accounts ({{ regularUsers.length }})</option>
                <option value="active">Active Only</option>
                <option value="inactive">Deactivated / Blocked</option>
              </select>
              <span class="tk-pill-counter">Showing {{ filteredRegularUsers.length }} of {{ regularUsers.length }}</span>
            </div>
          </div>

          <!-- Trekkers Table -->
          <div class="tk-table-wrapper">
            <table class="tk-table">
              <thead>
                <tr>
                  <th style="width:70px;">ID</th>
                  <th>Trekker</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredRegularUsers" :key="user.id">
                  <td style="font-weight:700;color:var(--text-muted);">#{{ user.id }}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div class="tk-user-row-avatar">{{ (user.username || 'U').charAt(0).toUpperCase() }}</div>
                      <div>
                        <div style="font-weight:700;color:var(--text-primary);">{{ user.username }}</div>
                        <span style="font-size:0.75rem;color:var(--text-muted);">Trekker Account</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style="color:var(--text-secondary);">📧 {{ user.email }}</span>
                  </td>
                  <td>
                    <span class="tk-badge tk-badge-success">Trekker</span>
                  </td>
                  <td>
                    <span style="display:inline-flex;align-items:center;gap:6px;font-size:0.8rem;font-weight:600;" :style="user.active ? 'color:var(--forest-light)' : 'color:var(--danger)'">
                      <span class="tk-pulse" :style="user.active ? '' : 'background:var(--danger)'"></span>
                      {{ user.active ? 'Active' : 'Deactivated' }}
                    </span>
                  </td>
                  <td style="text-align:right;">
                    <button
                      class="tk-btn tk-btn-xs"
                      :class="user.active ? 'tk-btn-danger' : 'tk-btn-primary'"
                      @click="toggleUserStatus(user.id)"
                    >
                      {{ user.active ? '⛔ Deactivate' : '✅ Activate' }}
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredRegularUsers.length === 0">
                  <td colspan="6">
                    <div class="tk-empty-state">
                      <div class="tk-empty-state-icon">👤</div>
                      <div class="tk-empty-state-title">No trekkers match your search or filter</div>
                      <p style="font-size:0.85rem;color:var(--text-muted);margin-top:4px;">
                        Try resetting your search query or status filter.
                      </p>
                      <button class="tk-btn tk-btn-ghost-green tk-btn-xs" style="margin-top:10px;" @click="userSearch = ''; userStatusFilter = ''">
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============================================================
           TAB 3: BIFURCATED - CERTIFIED GUIDES & STAFF
           ============================================================ -->
      <div v-if="currentTab === 'staff'" class="tk-card tk-section tk-slide-up">
        <div class="tk-card-header">
          <div>
            <h4>🧭 Certified Mountain Guides & Staff</h4>
            <div style="font-size:0.8rem;color:rgba(255,255,255,0.8);margin-top:2px;">
              Manage licensed expedition leaders, assign treks, and verify credentials
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button class="tk-btn tk-btn-xs" style="background:rgba(255,255,255,0.2);color:white;" @click="setTab('users')">
              👤 Switch to Trekkers Table
            </button>
            <button class="tk-btn tk-btn-gold tk-btn-xs" @click="setTab('createstaff')">
              ➕ Add New Guide
            </button>
          </div>
        </div>

        <div class="tk-card-body">
          <!-- Filter & Search Bar for Staff -->
          <div class="tk-filter-bar">
            <div class="tk-filter-search-group">
              <span class="tk-search-icon">🔍</span>
              <input
                type="text"
                class="tk-input"
                placeholder="Search guides by name, email, or guide ID..."
                v-model="staffSearch"
                style="font-size:0.85rem;"
              >
              <button v-if="staffSearch" class="tk-btn tk-btn-ghost-green tk-btn-xs" @click="staffSearch = ''">✕ Clear</button>
            </div>

            <div class="tk-filter-select-group">
              <span style="font-size:0.8rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Status:</span>
              <select class="tk-select" v-model="staffStatusFilter" style="font-size:0.85rem;padding:7px 32px 7px 12px;width:auto;">
                <option value="">All Guides ({{ staffUsers.length }})</option>
                <option value="active">Active Only</option>
                <option value="inactive">Deactivated / Suspended</option>
              </select>
              <span class="tk-pill-counter">Showing {{ filteredStaffUsers.length }} of {{ staffUsers.length }}</span>
            </div>
          </div>

          <!-- Staff Table -->
          <div class="tk-table-wrapper">
            <table class="tk-table">
              <thead>
                <tr>
                  <th style="width:70px;">ID</th>
                  <th>Mountain Guide</th>
                  <th>Email Address</th>
                  <th>Assigned Expeditions</th>
                  <th>Licensing Status</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="staff in filteredStaffUsers" :key="staff.id">
                  <td style="font-weight:700;color:var(--text-muted);">#{{ staff.id }}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div class="tk-guide-row-avatar">{{ (staff.username || 'G').charAt(0).toUpperCase() }}</div>
                      <div>
                        <div style="font-weight:700;color:var(--text-primary);">{{ staff.username }}</div>
                        <span style="font-size:0.75rem;color:var(--forest-light);font-weight:600;">🧭 Certified Expedition Guide</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style="color:var(--text-secondary);">📧 {{ staff.email }}</span>
                  </td>
                  <td>
                    <span class="tk-badge tk-badge-sky">
                      {{ getGuideTrekCount(staff.id) }} Expeditions
                    </span>
                  </td>
                  <td>
                    <span style="display:inline-flex;align-items:center;gap:6px;font-size:0.8rem;font-weight:600;" :style="staff.active ? 'color:var(--forest-light)' : 'color:var(--danger)'">
                      <span class="tk-pulse" :style="staff.active ? '' : 'background:var(--danger)'"></span>
                      {{ staff.active ? 'Active / Certified' : 'Deactivated / Suspended' }}
                    </span>
                  </td>
                  <td style="text-align:right;">
                    <button
                      class="tk-btn tk-btn-xs"
                      :class="staff.active ? 'tk-btn-danger' : 'tk-btn-primary'"
                      @click="toggleUserStatus(staff.id)"
                    >
                      {{ staff.active ? '⛔ Suspend' : '✅ Activate' }}
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredStaffUsers.length === 0">
                  <td colspan="6">
                    <div class="tk-empty-state">
                      <div class="tk-empty-state-icon">🧭</div>
                      <div class="tk-empty-state-title">No guides match your search or filter</div>
                      <p style="font-size:0.85rem;color:var(--text-muted);margin-top:4px;">
                        Try resetting your search query or register a new guide.
                      </p>
                      <button class="tk-btn tk-btn-ghost-green tk-btn-xs" style="margin-top:10px;" @click="staffSearch = ''; staffStatusFilter = ''">
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============================================================
           TAB 4: ALL TREKS
           ============================================================ -->
      <div v-if="currentTab === 'treks'" class="tk-card tk-section tk-slide-up">
        <div class="tk-card-header">
          <h4>⛰️ All Expeditions ({{ treks.length }})</h4>
          <button class="tk-btn tk-btn-primary tk-btn-sm" @click="currentTab = 'create'">
            ➕ Add Expedition
          </button>
        </div>
        <div class="tk-card-body">
          <div class="tk-table-wrapper">
            <table class="tk-table">
              <thead>
                <tr>
                  <th>Trek Name</th>
                  <th>Location</th>
                  <th>Difficulty</th>
                  <th>Duration</th>
                  <th>Slots</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Assigned Guide</th>
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
                  <td>⏱️ {{ trek.duration }}</td>
                  <td>
                    <span :style="trek.slots < 5 ? 'color:var(--danger);font-weight:700;' : 'color:var(--forest-light);font-weight:600;'">
                      {{ trek.slots }} left
                    </span>
                  </td>
                  <td style="font-weight:700;color:var(--forest);">₹{{ formatNumber(trek.price) }}</td>
                  <td>
                    <span class="tk-badge"
                      :class="trek.status === 'Open' ? 'tk-badge-success' : trek.status === 'Completed' ? 'tk-badge-sky' : 'tk-badge-danger'">
                      {{ trek.status }}
                    </span>
                  </td>
                  <td>🧭 {{ guideName(trek.assigned_guide_id) }}</td>
                  <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                      <button class="tk-btn tk-btn-ghost-green tk-btn-xs" @click="editTrek(trek)">✏️ Edit</button>
                      <button class="tk-btn tk-btn-danger tk-btn-xs" @click="openDeleteModal(trek)">🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="treks.length === 0">
                  <td colspan="9">
                    <div class="tk-empty-state">
                      <div class="tk-empty-state-icon">⛰️</div>
                      <div class="tk-empty-state-title">No expeditions found</div>
                      <button class="tk-btn tk-btn-primary tk-btn-sm" style="margin-top:10px;" @click="currentTab = 'create'">
                        Create First Trek
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============================================================
           TAB 5: CREATE / EDIT TREK
           ============================================================ -->
      <div v-if="currentTab === 'create'" class="tk-card tk-section tk-slide-up">
        <div class="tk-card-header">
          <h4>{{ editMode ? '✏️ Edit Expedition Details' : '➕ Create New Expedition' }}</h4>
          <button v-if="editMode" class="tk-btn tk-btn-sm" style="background:rgba(255,255,255,0.15);color:white;border:none;" @click="clearForm">✕ Cancel</button>
        </div>
        <div class="tk-card-body">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1rem;">
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">Trek Name</label>
              <input class="tk-input" v-model="trekForm.name" placeholder="e.g. Kedarkantha Summit Expedition">
            </div>
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">Location</label>
              <input class="tk-input" v-model="trekForm.location" placeholder="e.g. Sankri, Uttarakhand">
            </div>
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">Difficulty</label>
              <select class="tk-select" v-model="trekForm.difficulty">
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
                <option value="Difficult">Difficult</option>
              </select>
            </div>
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">Duration</label>
              <input class="tk-input" v-model="trekForm.duration" placeholder="e.g. 5 Days / 4 Nights">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1rem;">
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">Available Slots</label>
              <input class="tk-input" type="number" min="1" v-model="trekForm.slots" placeholder="e.g. 20">
            </div>
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">Price per Person (₹)</label>
              <input class="tk-input" type="number" min="0" v-model="trekForm.price" placeholder="e.g. 8500">
            </div>
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">Start Date</label>
              <input class="tk-input" type="date" v-model="trekForm.start_date">
            </div>
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">End Date</label>
              <input class="tk-input" type="date" v-model="trekForm.end_date">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1rem;">
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">Expedition Status</label>
              <select class="tk-select" v-model="trekForm.status">
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">Assign Certified Guide</label>
              <select class="tk-select" v-model="trekForm.assigned_guide_id">
                <option value="">— Unassigned —</option>
                <option v-for="g in guides" :key="g.id" :value="g.id">
                  🧭 {{ g.username }} ({{ g.email }})
                </option>
              </select>
            </div>
          </div>

          <div class="tk-form-group">
            <label class="tk-label">Description & Highlights</label>
            <textarea class="tk-textarea" v-model="trekForm.description" placeholder="Comprehensive route description, altitude, gear required..."></textarea>
          </div>

          <div style="display:flex;gap:10px;">
            <button v-if="!editMode" class="tk-btn tk-btn-primary" @click="createTrek" :disabled="isSubmittingTrek">
              <span v-if="isSubmittingTrek" class="tk-spinner" style="margin-right:6px;"></span>
              🏔️ {{ isSubmittingTrek ? 'Creating...' : 'Publish Expedition' }}
            </button>
            <button v-else class="tk-btn tk-btn-gold" @click="updateTrek" :disabled="isSubmittingTrek">
              <span v-if="isSubmittingTrek" class="tk-spinner" style="margin-right:6px;"></span>
              💾 {{ isSubmittingTrek ? 'Updating...' : 'Save Changes' }}
            </button>
            <button v-if="editMode" class="tk-btn tk-btn-ghost-green" @click="clearForm">✕ Cancel</button>
          </div>
        </div>
      </div>

      <!-- ============================================================
           TAB 6: ALL BOOKINGS
           ============================================================ -->
      <div v-if="currentTab === 'bookings'" class="tk-card tk-section tk-slide-up">
        <div class="tk-card-header">
          <h4>🎒 Platform Bookings ({{ bookings.length }})</h4>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <div class="tk-search-wrapper" style="min-width:180px;">
              <span class="tk-search-icon">🔍</span>
              <input type="text" class="tk-input" placeholder="Search bookings..." v-model="bookingSearch" style="font-size:0.8rem;padding:6px 6px 6px 30px;">
            </div>
            <select class="tk-select" v-model="paymentStatusFilter" style="font-size:0.8rem;padding:6px 28px 6px 10px;width:auto;">
              <option value="">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div class="tk-card-body">
          <div class="tk-table-wrapper">
            <table class="tk-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Trekker</th>
                  <th>Expedition</th>
                  <th>Guide</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in getFilteredBookings()" :key="b.id">
                  <td style="font-weight:700;color:var(--text-muted);">#{{ b.id }}</td>
                  <td style="font-weight:700;color:var(--text-primary);">👤 {{ b.username }}</td>
                  <td>⛰️ {{ b.trek_name }}</td>
                  <td>🧭 {{ b.guide_name }}</td>
                  <td style="font-size:0.8rem;">{{ b.booking_date }}</td>
                  <td style="font-weight:800;color:var(--forest);">₹{{ formatNumber(b.total_amount) }}</td>
                  <td>
                    <span class="tk-badge"
                      :class="b.payment_status === 'Paid' ? 'tk-badge-success' : b.payment_status === 'Pending Verification' ? 'tk-badge-warning' : 'tk-badge-danger'">
                      {{ b.payment_status }}
                    </span>
                  </td>
                  <td>
                    <span class="tk-badge"
                      :class="b.booking_status === 'Booked' ? 'tk-badge-success' : b.booking_status === 'Cancelled' ? 'tk-badge-danger' : 'tk-badge-stone'">
                      {{ b.booking_status }}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                      <button
                        v-if="b.payment_status === 'Pending Verification' || b.payment_status === 'Pending'"
                        class="tk-btn tk-btn-primary tk-btn-xs"
                        @click="approvePayment(b.id)"
                      >
                        ✅ Approve
                      </button>
                      <button
                        v-if="b.booking_status !== 'Cancelled'"
                        class="tk-btn tk-btn-danger tk-btn-xs"
                        @click="openCancelBookingModal(b)"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="getFilteredBookings().length === 0">
                  <td colspan="9">
                    <div class="tk-empty-state">
                      <div class="tk-empty-state-icon">🎒</div>
                      <div class="tk-empty-state-title">No bookings match your filter</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============================================================
           TAB 7: CREATE STAFF / GUIDE
           ============================================================ -->
      <div v-if="currentTab === 'createstaff'" class="tk-card tk-section tk-slide-up">
        <div class="tk-card-header">
          <h4>🧭 Add New Certified Guide / Staff Member</h4>
        </div>
        <div class="tk-card-body">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-bottom:1.25rem;">
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">👤 Guide Username</label>
              <input class="tk-input" v-model="staffForm.username" placeholder="e.g. guide_rahul">
            </div>
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">📧 Email Address</label>
              <input type="email" class="tk-input" v-model="staffForm.email" placeholder="e.g. rahul@trekkaro.com">
            </div>
            <div class="tk-form-group" style="margin-bottom:0;">
              <label class="tk-label">🔒 Temporary Password</label>
              <input type="password" class="tk-input" v-model="staffForm.password" placeholder="Create temporary password">
            </div>
          </div>
          <button class="tk-btn tk-btn-primary" @click="createStaff" :disabled="isSubmittingStaff">
            <span v-if="isSubmittingStaff" class="tk-spinner" style="margin-right:6px;"></span>
            🧭 {{ isSubmittingStaff ? 'Creating...' : 'Create Guide Account' }}
          </button>
        </div>
      </div>

      <!-- ============================================================
           CONFIRMATION MODALS
           ============================================================ -->

      <!-- Delete Trek Modal -->
      <div v-if="trekToDelete" class="tk-modal-overlay" @click.self="trekToDelete = null">
        <div class="tk-modal-card" style="max-width:440px;">
          <div class="tk-modal-header" style="background:linear-gradient(135deg, #7f1d1d, #b91c1c);">
            <h3>🗑️ Delete Expedition?</h3>
            <button class="tk-modal-close-btn" @click="trekToDelete = null">✕</button>
          </div>
          <div class="tk-modal-body">
            <p style="font-size:0.95rem;color:var(--text-primary);margin-bottom:0.75rem;">
              Are you sure you want to permanently delete <strong>{{ trekToDelete.name }}</strong>?
            </p>
            <p style="font-size:0.85rem;color:var(--danger);line-height:1.5;">
              ⚠️ Warning: Any active bookings for this trek will be notified and removed. This action cannot be undone.
            </p>
          </div>
          <div class="tk-modal-footer">
            <button class="tk-btn tk-btn-ghost-green" @click="trekToDelete = null">Cancel</button>
            <button class="tk-btn tk-btn-danger" @click="confirmDeleteTrek">
              Confirm Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Cancel Booking Modal -->
      <div v-if="bookingToCancel" class="tk-modal-overlay" @click.self="bookingToCancel = null">
        <div class="tk-modal-card" style="max-width:440px;">
          <div class="tk-modal-header" style="background:linear-gradient(135deg, #7f1d1d, #b91c1c);">
            <h3>⚠️ Cancel Booking #{{ bookingToCancel.id }}?</h3>
            <button class="tk-modal-close-btn" @click="bookingToCancel = null">✕</button>
          </div>
          <div class="tk-modal-body">
            <p style="font-size:0.95rem;color:var(--text-primary);margin-bottom:0.5rem;">
              Cancel booking for trekker <strong>{{ bookingToCancel.username }}</strong> on <strong>{{ bookingToCancel.trek_name }}</strong>?
            </p>
            <p style="font-size:0.85rem;color:var(--danger);">
              The trek slot will be restored back to the available inventory.
            </p>
          </div>
          <div class="tk-modal-footer">
            <button class="tk-btn tk-btn-ghost-green" @click="bookingToCancel = null">Keep Active</button>
            <button class="tk-btn tk-btn-danger" @click="confirmCancelBooking">Confirm Cancellation</button>
          </div>
        </div>
      </div>

    </div>
  `,
  data() {
    return {
      currentTab: "stats",
      toasts: [],
      stats: { total_treks: 0, total_bookings: 0, total_users: 0, total_staff: 0 },
      analytics: {
        kpis: {
          total_revenue: 0,
          pending_revenue: 0,
          cancelled_revenue: 0,
          total_bookings: 0,
          confirmed_bookings: 0,
          pending_bookings: 0,
          verification_bookings: 0,
          cancelled_bookings: 0,
          avg_booking_value: 0,
          conversion_rate: 0,
          total_treks: 0,
          open_treks: 0,
          total_slots_capacity: 0,
          total_slots_booked: 0,
          overall_occupancy_rate: 0,
          total_users: 0,
          active_users: 0,
          inactive_users: 0,
          total_staff: 0,
          active_guides: 0,
          inactive_guides: 0
        },
        trends: [],
        booking_status_distribution: { labels: [], data: [], colors: [] },
        trek_difficulty_distribution: { labels: [], data: [], colors: [] },
        trek_status_distribution: { labels: [], data: [], colors: [] },
        top_treks: [],
        all_treks_utilization: [],
        guides: []
      },
      analyticsTimeframe: "all",
      isLoadingAnalytics: false,
      chartInstances: {},
      treks: [],
      guides: [],
      users: [],
      bookings: [],
      userSearch: "",
      userStatusFilter: "",
      staffSearch: "",
      staffStatusFilter: "",
      bookingSearch: "",
      bookingStatusFilter: "",
      paymentStatusFilter: "",
      editMode: false,
      isExporting: false,
      isSubmittingTrek: false,
      isSubmittingStaff: false,
      trekToDelete: null,
      bookingToCancel: null,
      trekForm: {
        id: "", name: "", location: "", difficulty: "Easy",
        duration: "", slots: "", price: "", description: "",
        start_date: "", end_date: "", status: "Open", assigned_guide_id: ""
      },
      staffForm: { username: "", email: "", password: "" }
    }
  },
  computed: {
    regularUsers() {
      return this.users.filter(u => u.role !== "staff" && u.role !== "admin")
    },
    staffUsers() {
      return this.users.filter(u => u.role === "staff")
    },
    filteredRegularUsers() {
      let list = this.regularUsers
      if (this.userStatusFilter === "active") {
        list = list.filter(u => u.active === true)
      } else if (this.userStatusFilter === "inactive") {
        list = list.filter(u => u.active === false)
      }
      if (!this.userSearch) return list
      const s = this.userSearch.trim().toLowerCase()
      return list.filter(u =>
        (u.username && u.username.toLowerCase().includes(s)) ||
        (u.email && u.email.toLowerCase().includes(s)) ||
        String(u.id).includes(s)
      )
    },
    filteredStaffUsers() {
      let list = this.staffUsers
      if (this.staffStatusFilter === "active") {
        list = list.filter(u => u.active === true)
      } else if (this.staffStatusFilter === "inactive") {
        list = list.filter(u => u.active === false)
      }
      if (!this.staffSearch) return list
      const s = this.staffSearch.trim().toLowerCase()
      return list.filter(u =>
        (u.username && u.username.toLowerCase().includes(s)) ||
        (u.email && u.email.toLowerCase().includes(s)) ||
        String(u.id).includes(s)
      )
    },
    pendingVerificationsCount() {
      return this.bookings.filter(b => b.payment_status === "Pending Verification").length
    },
    openTreksCount() {
      return this.treks.filter(t => t.status === "Open").length
    },
    totalPlatformRevenue() {
      return this.bookings
        .filter(b => b.payment_status === "Paid")
        .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0)
    }
  },
  watch: {
    currentTab(newTab) {
      if (newTab === "stats") {
        this.$nextTick(() => {
          this.renderAllCharts()
        })
      }
    }
  },
  mounted() {
    this.loadStats()
    this.loadAnalytics()
    this.loadTreks()
    this.loadGuides()
    this.loadUsers()
    this.loadBookings()
  },
  beforeDestroy() {
    this.destroyAllCharts()
  },
  methods: {
    formatNumber(num) {
      if (num === null || num === undefined) return "0"
      return Number(num).toLocaleString('en-IN')
    },
    setTab(tab) {
      this.currentTab = tab
      if (tab === 'stats') {
        this.$nextTick(() => {
          this.renderAllCharts()
        })
      }
    },
    setTimeframe(tf) {
      this.analyticsTimeframe = tf
      this.renderRevenueTrendChart()
    },
    showToast(text, type = "success") {
      const id = Date.now() + Math.random()
      const icons = { success: "✅", error: "⚠️", warning: "🔔", info: "ℹ️" }
      this.toasts.push({ id, text, type, icon: icons[type] || "✅" })
      setTimeout(() => { this.removeToast(id) }, 3500)
    },
    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },
    getGuideTrekCount(guideId) {
      return this.treks.filter(t => t.assigned_guide_id === guideId).length
    },
    getFilteredBookings() {
      let result = []
      const search = this.bookingSearch.trim().toLowerCase()
      for (let i = 0; i < this.bookings.length; i++) {
        const b = this.bookings[i]
        if (this.bookingStatusFilter && b.booking_status !== this.bookingStatusFilter) continue
        if (this.paymentStatusFilter && b.payment_status !== this.paymentStatusFilter) continue
        if (search) {
          let found = false
          if (String(b.id).includes(search)) found = true
          if (b.trek_name && b.trek_name.toLowerCase().includes(search)) found = true
          if (b.username && b.username.toLowerCase().includes(search)) found = true
          if (b.guide_name && b.guide_name.toLowerCase().includes(search)) found = true
          if (b.booking_date && b.booking_date.toLowerCase().includes(search)) found = true
          if (!found) continue
        }
        result.push(b)
      }
      return result
    },
    loadStats() {
      fetch('/api/admin/stats', {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") }
      })
        .then(r => r.json())
        .then(data => { this.stats = data })
        .catch(() => {})
    },
    loadAnalytics() {
      this.isLoadingAnalytics = true
      fetch('/api/admin/analytics', {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") }
      })
        .then(r => r.json())
        .then(data => {
          if (data && data.kpis) {
            this.analytics = data
            this.$nextTick(() => {
              if (this.currentTab === "stats") {
                this.renderAllCharts()
              }
            })
          }
        })
        .catch(() => {
          this.showToast("Failed to load analytics data", "error")
        })
        .finally(() => {
          this.isLoadingAnalytics = false
        })
    },

    // Chart.js Visualizations
    destroyChart(key) {
      if (this.chartInstances && this.chartInstances[key]) {
        this.chartInstances[key].destroy()
        delete this.chartInstances[key]
      }
    },
    destroyAllCharts() {
      Object.keys(this.chartInstances).forEach(key => {
        if (this.chartInstances[key]) {
          this.chartInstances[key].destroy()
        }
      })
      this.chartInstances = {}
    },
    renderAllCharts() {
      if (!window.Chart) {
        setTimeout(() => { this.renderAllCharts() }, 200)
        return
      }
      this.renderRevenueTrendChart()
      this.renderBookingStatusChart()
      this.renderDifficultyChart()
      this.renderTopTreksChart()
      this.renderSlotCapacityChart()
      this.renderGuideWorkloadChart()
    },

    renderRevenueTrendChart() {
      const canvas = document.getElementById('revenueTrendChart')
      if (!canvas) return
      this.destroyChart('revenueTrend')

      let trends = this.analytics.trends || []
      if (this.analyticsTimeframe === '6m') {
        trends = trends.slice(-6)
      } else if (this.analyticsTimeframe === '30d') {
        trends = trends.slice(-2)
      }

      const labels = trends.map(t => t.label || t.key)
      const paidData = trends.map(t => t.paid || 0)
      const pendingData = trends.map(t => t.pending || 0)
      const bookingCounts = trends.map(t => t.bookings || 0)

      this.chartInstances['revenueTrend'] = new window.Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['Current Period'],
          datasets: [
            {
              label: 'Paid Revenue (₹)',
              data: paidData.length ? paidData : [0],
              backgroundColor: 'rgba(45, 90, 61, 0.85)',
              borderColor: '#1a3a2a',
              borderWidth: 1.5,
              borderRadius: 6,
              yAxisID: 'y'
            },
            {
              label: 'Pending Revenue (₹)',
              data: pendingData.length ? pendingData : [0],
              backgroundColor: 'rgba(212, 168, 85, 0.85)',
              borderColor: '#8b5e3c',
              borderWidth: 1.5,
              borderRadius: 6,
              yAxisID: 'y'
            },
            {
              label: 'Bookings Volume',
              data: bookingCounts.length ? bookingCounts : [0],
              type: 'line',
              borderColor: '#4a90b8',
              backgroundColor: 'rgba(74, 144, 184, 0.2)',
              borderWidth: 2.5,
              pointBackgroundColor: '#4a90b8',
              pointRadius: 4,
              tension: 0.35,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Outfit', size: 11, weight: '600' } } },
            tooltip: {
              callbacks: {
                label: function(context) {
                  if (context.dataset.yAxisID === 'y') {
                    return `${context.dataset.label}: ₹${Number(context.raw).toLocaleString('en-IN')}`
                  }
                  return `${context.dataset.label}: ${context.raw} orders`
                }
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 11 } } },
            y: {
              type: 'linear',
              position: 'left',
              grid: { color: 'rgba(0,0,0,0.06)' },
              ticks: {
                callback: function(val) { return '₹' + (val >= 1000 ? (val/1000) + 'k' : val) },
                font: { family: 'Outfit', size: 11 }
              }
            },
            y1: {
              type: 'linear',
              position: 'right',
              grid: { display: false },
              ticks: { precision: 0, font: { family: 'Outfit', size: 11 } }
            }
          }
        }
      })
    },

    renderBookingStatusChart() {
      const canvas = document.getElementById('bookingStatusChart')
      if (!canvas) return
      this.destroyChart('bookingStatus')

      const dist = this.analytics.booking_status_distribution || {}
      const labels = dist.labels || ["Confirmed (Paid)", "Pending Verification", "Payment Pending", "Cancelled"]
      const data = dist.data || [0, 0, 0, 0]
      const colors = ['#2d5a3d', '#d4a855', '#4a90b8', '#c0392b']

      this.chartInstances['bookingStatus'] = new window.Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14, font: { family: 'Outfit', size: 11 } } }
          }
        }
      })
    },

    renderDifficultyChart() {
      const canvas = document.getElementById('difficultyChart')
      if (!canvas) return
      this.destroyChart('difficulty')

      const diff = this.analytics.trek_difficulty_distribution || {}
      const labels = diff.labels || ['Easy', 'Moderate', 'Hard', 'Difficult']
      const data = diff.data || [0, 0, 0, 0]
      const colors = ['#3d7a52', '#d4a855', '#c4895a', '#c0392b']

      this.chartInstances['difficulty'] = new window.Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Outfit', size: 11 } } }
          }
        }
      })
    },

    renderTopTreksChart() {
      const canvas = document.getElementById('topTreksChart')
      if (!canvas) return
      this.destroyChart('topTreks')

      const top = (this.analytics.top_treks || []).slice(0, 5)
      const labels = top.map(t => t.name.length > 18 ? t.name.substring(0, 18) + '...' : t.name)
      const revenues = top.map(t => t.revenue)

      this.chartInstances['topTreks'] = new window.Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['No Treks'],
          datasets: [{
            label: 'Revenue (₹)',
            data: revenues.length ? revenues : [0],
            backgroundColor: 'rgba(212, 168, 85, 0.85)',
            borderColor: '#8b5e3c',
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(ctx) { return '₹' + Number(ctx.raw).toLocaleString('en-IN') }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                callback: function(v) { return '₹' + (v >= 1000 ? (v/1000) + 'k' : v) },
                font: { family: 'Outfit', size: 10 }
              }
            },
            y: { ticks: { font: { family: 'Outfit', size: 11 } } }
          }
        }
      })
    },

    renderSlotCapacityChart() {
      const canvas = document.getElementById('slotCapacityChart')
      if (!canvas) return
      this.destroyChart('slotCapacity')

      const treks = (this.analytics.all_treks_utilization || []).slice(0, 6)
      const labels = treks.map(t => t.name.length > 16 ? t.name.substring(0, 16) + '...' : t.name)
      const booked = treks.map(t => t.slots_booked)
      const available = treks.map(t => t.slots_available)

      this.chartInstances['slotCapacity'] = new window.Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['No Data'],
          datasets: [
            {
              label: 'Booked Slots',
              data: booked.length ? booked : [0],
              backgroundColor: '#2d5a3d',
              borderRadius: 4
            },
            {
              label: 'Available Slots',
              data: available.length ? available : [0],
              backgroundColor: '#a8d5b5',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true, ticks: { font: { family: 'Outfit', size: 10 } } },
            y: { stacked: true, ticks: { precision: 0, font: { family: 'Outfit', size: 10 } } }
          },
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 10, font: { family: 'Outfit', size: 11 } } }
          }
        }
      })
    },

    renderGuideWorkloadChart() {
      const canvas = document.getElementById('guideWorkloadChart')
      if (!canvas) return
      this.destroyChart('guideWorkload')

      const guides = this.analytics.guides || []
      const labels = guides.map(g => g.username)
      const treksCount = guides.map(g => g.treks_count)
      const trekkersCount = guides.map(g => g.trekkers_count)

      this.chartInstances['guideWorkload'] = new window.Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['No Guides'],
          datasets: [
            {
              label: 'Assigned Treks',
              data: treksCount.length ? treksCount : [0],
              backgroundColor: '#4a90b8',
              borderRadius: 4
            },
            {
              label: 'Trekkers Guided',
              data: trekkersCount.length ? trekkersCount : [0],
              backgroundColor: '#d4a855',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { font: { family: 'Outfit', size: 11 } } },
            y: { ticks: { precision: 0, font: { family: 'Outfit', size: 10 } } }
          },
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 10, font: { family: 'Outfit', size: 11 } } }
          }
        }
      })
    },

    createStaff() {
      if (!this.staffForm.username || !this.staffForm.email || !this.staffForm.password) {
        this.showToast("Please fill all staff credentials", "warning")
        return
      }
      this.isSubmittingStaff = true
      fetch('/api/admin/create-staff', {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") },
        body: JSON.stringify(this.staffForm)
      })
        .then(r => r.json())
        .then(data => {
          if (data.message && data.message.includes("successfully")) {
            this.showToast(data.message, "success")
            this.staffForm = { username: "", email: "", password: "" }
            this.loadStats()
            this.loadGuides()
            this.loadUsers()
            this.loadAnalytics()
            this.currentTab = 'staff'
          } else {
            this.showToast(data.message || "Failed to create staff", "error")
          }
        })
        .catch(() => {
          this.showToast("Network error while creating staff", "error")
        })
        .finally(() => {
          this.isSubmittingStaff = false
        })
    },
    loadTreks() {
      fetch('/api/treks', {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") }
      })
        .then(r => r.json())
        .then(data => { this.treks = data.message ? [] : data })
        .catch(() => { this.treks = [] })
    },
    loadGuides() {
      fetch('/api/admin/guides', {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") }
      })
        .then(r => r.json())
        .then(data => { this.guides = Array.isArray(data) ? data : [] })
        .catch(() => { this.guides = [] })
    },
    guideName(id) {
      if (!id) return "—"
      for (let i = 0; i < this.guides.length; i++) {
        if (this.guides[i].id === id) return this.guides[i].username
      }
      return "—"
    },
    createTrek() {
      this.isSubmittingTrek = true
      fetch('/api/treks/create', {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") },
        body: JSON.stringify(this.trekForm)
      })
        .then(r => r.json())
        .then(data => {
          this.showToast(data.message || "Trek created successfully", "success")
          this.clearForm()
          this.loadTreks()
          this.loadStats()
          this.loadAnalytics()
          this.currentTab = 'treks'
        })
        .catch(() => {
          this.showToast("Failed to create trek", "error")
        })
        .finally(() => {
          this.isSubmittingTrek = false
        })
    },
    editTrek(trek) {
      this.currentTab = 'create'
      this.editMode = true
      this.trekForm.id = trek.id
      this.trekForm.name = trek.name
      this.trekForm.location = trek.location
      this.trekForm.difficulty = trek.difficulty
      this.trekForm.duration = trek.duration
      this.trekForm.slots = trek.slots
      this.trekForm.price = trek.price
      this.trekForm.description = trek.description
      this.trekForm.start_date = trek.start_date
      this.trekForm.end_date = trek.end_date
      this.trekForm.status = trek.status
      this.trekForm.assigned_guide_id = trek.assigned_guide_id || ""
    },
    updateTrek() {
      this.isSubmittingTrek = true
      fetch('/api/treks/update/' + this.trekForm.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") },
        body: JSON.stringify(this.trekForm)
      })
        .then(r => r.json())
        .then(data => {
          this.showToast(data.message || "Trek updated successfully", "success")
          this.clearForm()
          this.loadTreks()
          this.loadStats()
          this.loadAnalytics()
          this.currentTab = 'treks'
        })
        .catch(() => {
          this.showToast("Failed to update trek", "error")
        })
        .finally(() => {
          this.isSubmittingTrek = false
        })
    },
    openDeleteModal(trek) {
      this.trekToDelete = trek
    },
    confirmDeleteTrek() {
      if (!this.trekToDelete) return
      const id = this.trekToDelete.id
      fetch('/api/treks/delete/' + id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") }
      })
        .then(r => r.json())
        .then(data => {
          this.trekToDelete = null
          this.showToast(data.message || "Trek deleted successfully", "success")
          this.loadTreks()
          this.loadStats()
          this.loadAnalytics()
        })
        .catch(() => {
          this.showToast("Failed to delete trek", "error")
        })
    },
    clearForm() {
      this.editMode = false
      this.trekForm = {
        id: "", name: "", location: "", difficulty: "Easy",
        duration: "", slots: "", price: "", description: "",
        start_date: "", end_date: "", status: "Open", assigned_guide_id: ""
      }
    },
    loadUsers() {
      fetch('/api/admin/users', {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") }
      })
        .then(r => r.json())
        .then(data => { this.users = Array.isArray(data) ? data : [] })
        .catch(() => { this.users = [] })
    },
    toggleUserStatus(id) {
      fetch('/api/admin/toggle-user/' + id, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") }
      })
        .then(r => r.json())
        .then(data => {
          this.showToast(data.message || "User status updated", "success")
          this.loadUsers()
          this.loadStats()
          this.loadAnalytics()
        })
        .catch(() => {
          this.showToast("Failed to toggle user status", "error")
        })
    },
    loadBookings() {
      fetch('/api/bookings', {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") }
      })
        .then(r => r.json())
        .then(data => { this.bookings = data.message ? [] : data })
        .catch(() => { this.bookings = [] })
    },
    approvePayment(bookingId) {
      fetch('/api/bookings/update/' + bookingId, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") },
        body: JSON.stringify({ payment_status: "Paid" })
      })
        .then(r => r.json())
        .then(data => {
          this.showToast(data.message || "Payment approved!", "success")
          this.loadBookings()
          this.loadStats()
          this.loadAnalytics()
        })
        .catch(() => {
          this.showToast("Failed to approve payment", "error")
        })
    },
    openCancelBookingModal(booking) {
      this.bookingToCancel = booking
    },
    confirmCancelBooking() {
      if (!this.bookingToCancel) return
      const id = this.bookingToCancel.id
      fetch('/api/bookings/update/' + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth-token") },
        body: JSON.stringify({ booking_status: "Cancelled" })
      })
        .then(r => r.json())
        .then(data => {
          this.bookingToCancel = null
          this.showToast(data.message || "Booking cancelled", "success")
          this.loadBookings()
          this.loadStats()
          this.loadAnalytics()
        })
        .catch(() => {
          this.showToast("Failed to cancel booking", "error")
        })
    },
    // Authenticated Blob CSV Export
    exportCSV() {
      this.isExporting = true
      this.showToast("Generating comprehensive platform CSV export...", "info")

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
          a.download = `admin_trek_platform_${Date.now()}.csv`
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.URL.revokeObjectURL(url)
          this.showToast("Platform CSV downloaded successfully!", "success")
        })
        .catch(err => {
          this.showToast("Failed to export CSV. Please try again.", "error")
        })
        .finally(() => {
          this.isExporting = false
        })
    }
  }
}

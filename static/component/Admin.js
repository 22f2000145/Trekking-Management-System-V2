export default {
  template: `
    <div class="container mt-4">
      <h2 class="text-center mb-4">Admin Dashboard</h2>

      <div v-if="message" class="alert" :class="'alert-' + message.type">
        {{ message.text }}
      </div>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div class="d-flex justify-content-center gap-2 mb-4 bg-light p-2 rounded">
        <button class="btn btn-sm btn-outline-primary" :class="{'active': currentTab === 'stats'}" @click="currentTab = 'stats'">Statistics</button>
        <button class="btn btn-sm btn-outline-primary" :class="{'active': currentTab === 'treks'}" @click="currentTab = 'treks'">All Treks</button>
        <button class="btn btn-sm btn-outline-primary" :class="{'active': currentTab === 'create'}" @click="currentTab = 'create'">{{ editMode ? 'Edit Trek' : 'Create Trek' }}</button>
        <button class="btn btn-sm btn-outline-primary" :class="{'active': currentTab === 'bookings'}" @click="currentTab = 'bookings'">Bookings History</button>
        <button class="btn btn-sm btn-outline-primary" :class="{'active': currentTab === 'users'}" @click="currentTab = 'users'">Users & Staff</button>
        <button class="btn btn-sm btn-outline-primary" :class="{'active': currentTab === 'pending'}" @click="currentTab = 'pending'">
          Pending Approvals <span class="badge bg-danger" v-if="pending_staff.length > 0">{{ pending_staff.length }}</span>
        </button>
      </div>

      <div v-if="currentTab === 'stats'" class="card mb-4">
        <div class="card-header">
          <h4>Statistics</h4>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Total Treks</h5>
                  <p class="card-text">{{ stats.total_treks }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Total Bookings</h5>
                  <p class="card-text">{{ stats.total_bookings }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Total Users</h5>
                  <p class="card-text">{{ stats.total_users }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Total Staff</h5>
                  <p class="card-text">{{ stats.total_staff }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'pending'" class="card">
        <div class="card-header">
          <h4>Pending Staff Registrations</h4>
        </div>
        <div class="card-body">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="staff in pending_staff" :key="staff.id">
                <td>{{ staff.username }}</td>
                <td>{{ staff.email }}</td>
                <td>
                  <button class="btn btn-success" @click="approveStaff(staff.id)">Approve</button>
                  <button class="btn btn-danger" @click="rejectStaff(staff.id)">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="currentTab === 'create'" class="card mt-4">
        <div class="card-header">
          <h4>{{ editMode ? "Edit Trek" : "Create Trek" }}</h4>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4 mb-3">
              <label>Name</label>
              <input class="form-control" v-model="trekForm.name">
            </div>
            <div class="col-md-4 mb-3">
              <label>Location</label>
              <input class="form-control" v-model="trekForm.location">
            </div>
            <div class="col-md-4 mb-3">
              <label>Difficulty</label>
              <select class="form-select" v-model="trekForm.difficulty">
                <option>Easy</option>
                <option>Moderate</option>
                <option>Hard</option>
              </select>
            </div>
            <div class="col-md-3 mb-3">
              <label>Duration</label>
              <input type="number" class="form-control" v-model="trekForm.duration">
            </div>
            <div class="col-md-3 mb-3">
              <label>Slots</label>
              <input type="number" class="form-control" v-model="trekForm.slots">
            </div>
            <div class="col-md-3 mb-3">
              <label>Price</label>
              <input type="number" class="form-control" v-model="trekForm.price">
            </div>
            <div class="col-md-3 mb-3">
              <label>Status</label>
              <select class="form-select" v-model="trekForm.status">
                <option>Open</option>
                <option>Closed</option>
                <option>Completed</option>
                <option>Pending</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label>Start Date</label>
              <input type="date" class="form-control" v-model="trekForm.start_date">
            </div>
            <div class="col-md-6 mb-3">
              <label>End Date</label>
              <input type="date" class="form-control" v-model="trekForm.end_date">
            </div>
            <div class="col-md-12 mb-3">
              <label>Description</label>
              <textarea class="form-control" rows="3" v-model="trekForm.description"></textarea>
            </div>
            <div class="col-md-12 mb-3">
              <label>Assigned Guide</label>
              <select class="form-select" v-model="trekForm.assigned_guide_id">
                <option value="">None</option>
                <option v-for="g in guides" :key="g.id" :value="g.id">
                  {{ g.username }}
                </option>
              </select>
            </div>
            <div class="col-md-12">
              <button v-if="!editMode" class="btn btn-primary" @click="createTrek">Create Trek</button>
              <button v-if="editMode" class="btn btn-success" @click="updateTrek">Update Trek</button>
              <button v-if="editMode" class="btn btn-secondary ms-2" @click="clearForm">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'treks'" class="card mt-4">
        <div class="card-header">
          <h4>All Treks</h4>
        </div>
        <div class="card-body">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Difficulty</th>
                <th>Price</th>
                <th>Status</th>
                <th>Guide</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trek in treks" :key="trek.id">
                <td>{{ trek.name }}</td>
                <td>{{ trek.location }}</td>
                <td>{{ trek.difficulty }}</td>
                <td>₹{{ trek.price }}</td>
                <td>{{ trek.status }}</td>
                <td>{{ guideName(trek.assigned_guide_id) }}</td>
                <td>
                  <button class="btn btn-warning btn-sm me-2" @click="editTrek(trek)">Edit</button>
                  <button class="btn btn-danger btn-sm" @click="deleteTrek(trek.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="currentTab === 'bookings'" class="card mt-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h4 class="mb-0">Bookings & Trek History</h4>
          <button class="btn btn-success btn-sm" @click="exportCSV">Export CSV</button>
        </div>
        <div class="card-body">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Trek Name</th>
                <th>Trekker</th>
                <th>Guide</th>
                <th>Booking Date</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Booking Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in bookings" :key="b.id">
                <td>#{{ b.id }}</td>
                <td>{{ b.trek_name }}</td>
                <td>{{ b.username }}</td>
                <td>{{ b.guide_name }}</td>
                <td>{{ b.booking_date }}</td>
                <td>₹{{ b.total_amount }}</td>
                <td>{{ b.payment_status }}</td>
                <td>{{ b.booking_status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="currentTab === 'users'" class="card mt-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h4 class="mb-0">All Users & Staff</h4>
          <input type="text" class="form-control form-control-sm w-25" placeholder="Search username/email..." v-model="userSearch">
        </div>
        <div class="card-body">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in getFilteredUsers()" :key="user.id">
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td>{{ user.active ? 'Active' : 'Inactive' }}</td>
                <td>
                  <button class="btn btn-sm" :class="user.active ? 'btn-danger' : 'btn-success'" @click="toggleUserStatus(user.id)">
                    {{ user.active ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      currentTab: "stats",
      message: "",
      error: "",
      stats: {
        total_treks: 0,
        total_bookings: 0,
        total_users: 0,
        total_staff: 0,
      },
      pending_staff: [],
      treks: [],
      guides: [],
      users: [],
      bookings: [],
      userSearch: "",
      editMode: false,
      trekForm: {
        id: "",
        name: "",
        location: "",
        difficulty: "Easy",
        duration: "",
        slots: "",
        price: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "Open",
        assigned_guide_id: ""
      }
    }
  },

  mounted() {
    this.loadStats()
    this.loadPendingStaff()
    this.loadTreks()
    this.loadGuides()
    this.loadUsers()
    this.loadBookings()
  },
  methods: {
    getFilteredUsers() {
      if (!this.userSearch) return this.users
      var search = this.userSearch.toLowerCase()
      var result = []
      for (var i = 0; i < this.users.length; i++) {
        var u = this.users[i]
        if ((u.username && u.username.toLowerCase().includes(search)) ||
          (u.email && u.email.toLowerCase().includes(search))) {
          result.push(u)
        }
      }
      return result
    },
    loadStats() {
      fetch('/api/admin/stats', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        }
      })
        .then(response => response.json())
        .then(data => {
          this.stats = data
        })
    },
    loadPendingStaff() {
      fetch('/api/admin/pending-staff', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        }
      })
        .then(response => response.json())
        .then(data => {
          this.pending_staff = data
        })
    },
    approveStaff(id) {
      fetch('/api/admin/approve-staff/' + id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        }
      })
        .then(response => response.json())
        .then(data => {
          this.message = { text: data.message, type: "success" }
          this.loadStats()
          this.loadPendingStaff()
        })
    },
    rejectStaff(id) {
      fetch('/api/admin/reject-staff/' + id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        }
      })
        .then(response => response.json())
        .then(data => {
          this.message = { text: data.message, type: "success" }
          this.loadStats()
          this.loadPendingStaff()
        })
    },
    loadTreks() {
      fetch('/api/treks', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        }
      })
        .then(response => response.json())
        .then(data => {
          this.treks = data
        })
    },
    loadGuides() {
      fetch('/api/admin/guides', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        }
      })
        .then(response => response.json())
        .then(data => {
          this.guides = data
        })
    },
    guideName(id) {
      if (!id) return "None";
      for (let i = 0; i < this.guides.length; i++) {
        if (this.guides[i].id === id) {
          return this.guides[i].username;
        }
      }
      return "None";
    },
    createTrek() {
      fetch('/api/treks/create', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        },
        body: JSON.stringify(this.trekForm)
      })
        .then(response => response.json())
        .then(data => {
          this.message = { text: data.message, type: "success" }
          this.clearForm()
          this.loadTreks()
          this.loadStats()
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
      fetch('/api/treks/update/' + this.trekForm.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        },
        body: JSON.stringify(this.trekForm)
      })
        .then(response => response.json())
        .then(data => {
          this.message = { text: data.message, type: "success" }
          this.clearForm()
          this.loadTreks()
        })
    },
    deleteTrek(id) {
      if (!confirm("Are you sure you want to delete this trek?")) return;
      fetch('/api/treks/delete/' + id, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        }
      })
        .then(response => response.json())
        .then(data => {
          this.message = { text: data.message, type: "success" }
          this.loadTreks()
          this.loadStats()
        })
    },
    clearForm() {
      this.editMode = false
      this.trekForm.id = ""
      this.trekForm.name = ""
      this.trekForm.location = ""
      this.trekForm.difficulty = "Easy"
      this.trekForm.duration = ""
      this.trekForm.slots = ""
      this.trekForm.price = ""
      this.trekForm.description = ""
      this.trekForm.start_date = ""
      this.trekForm.end_date = ""
      this.trekForm.status = "Open"
      this.trekForm.assigned_guide_id = ""
    },
    loadUsers() {
      fetch('/api/admin/users', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        }
      })
        .then(response => response.json())
        .then(data => {
          this.users = data
        })
    },
    toggleUserStatus(id) {
      fetch('/api/admin/toggle-user/' + id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        }
      })
        .then(response => response.json())
        .then(data => {
          this.message = { text: data.message, type: "success" }
          this.loadUsers()
          this.loadStats()
        })
    },
    exportCSV() {
      window.open('/api/export?auth_token=' + localStorage.getItem("auth-token"))
    },
    loadBookings() {
      fetch('/api/bookings', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            this.bookings = []
          } else {
            this.bookings = data
          }
        })
    }
  }
}

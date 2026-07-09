export default {
  template: `
    <div class="container mt-4">
      <div v-if="message" class="alert alert-success">
        {{ message }}
      </div>

      <div class="mb-4 d-flex justify-content-between align-items-center">
        <h4>Welcome, {{ username }}</h4>
        <router-link to="/update" class="btn btn-outline-secondary btn-sm">Edit Profile</router-link>
      </div>

      <div v-if="role.includes('staff')">
        <div class="card mb-4">
          <div class="card-header">
            <h4>My Assigned Treks</h4>
          </div>
          <div class="card-body">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Trek Name</th>
                  <th>Location</th>
                  <th>Difficulty</th>
                  <th>Slots Available</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="trek in treks" :key="trek.id">
                  <td>{{ trek.name }}</td>
                  <td>{{ trek.location }}</td>
                  <td>{{ trek.difficulty }}</td>
                  <td>{{ trek.slots }}</td>
                  <td>{{ trek.status }}</td>
                  <td>
                    <button class="btn btn-warning btn-sm me-2" @click="editTrek(trek)">Update Status</button>
                    <button class="btn btn-info btn-sm" @click="loadParticipants(trek.id)">View Trekkers</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="editTrekMode" class="card mb-4">
          <div class="card-header">
            <h4>Update Trek Details: {{ trekForm.name }}</h4>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label>Available Slots</label>
                <input type="number" class="form-control" v-model="trekForm.slots">
              </div>
              <div class="col-md-6 mb-3">
                <label>Status</label>
                <select class="form-select" v-model="trekForm.status">
                  <option>Open</option>
                  <option>Closed</option>
                  <option>Completed</option>
                </select>
              </div>
              <div class="col-md-12">
                <button class="btn btn-success" @click="updateTrek">Save</button>
                <button class="btn btn-secondary ms-2" @click="clearTrekForm">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="viewParticipants" class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h4>Trekkers List (Trek ID: {{ selectedTrekId }})</h4>
            <button class="btn-close" @click="viewParticipants = false"></button>
          </div>
          <div class="card-body">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Trekker</th>
                  <th>Booking Date</th>
                  <th>Payment Status</th>
                  <th>Booking Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in getFilteredBookings()" :key="b.id">
                  <td>#{{ b.id }}</td>
                  <td>{{ b.username }}</td>
                  <td>{{ b.booking_date }}</td>
                  <td>{{ b.payment_status }}</td>
                  <td>{{ b.booking_status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h4 class="mb-0">Available Treks</h4>
            <div class="d-flex gap-2 w-75 justify-content-end">
              <input type="text" class="form-control form-control-sm w-30" placeholder="Search name/location..." v-model="trekSearch">
              <select class="form-select form-select-sm w-25" v-model="difficultyFilter">
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
              </select>
              <input type="number" class="form-control form-control-sm w-25" placeholder="Max duration (days)..." v-model="durationFilter">
            </div>
          </div>
          <div class="card-body">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Difficulty</th>
                  <th>Duration (Days)</th>
                  <th>Slots</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="trek in getFilteredTreks()" :key="trek.id">
                  <td>{{ trek.name }}</td>
                  <td>{{ trek.location }}</td>
                  <td>{{ trek.difficulty }}</td>
                  <td>{{ trek.duration }} Days</td>
                  <td>{{ trek.slots }}</td>
                  <td>₹{{ trek.price }}</td>
                  <td>
                    <button class="btn btn-primary btn-sm" @click="bookTrek(trek)">Book Now</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h4>My Bookings</h4>
          </div>
          <div class="card-body">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Trek ID</th>
                  <th>Booking Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in bookings" :key="b.id">
                  <td>#{{ b.id }}</td>
                  <td>{{ b.trek_id }}</td>
                  <td>{{ b.booking_date }}</td>
                  <td>₹{{ b.total_amount }}</td>
                  <td>{{ b.booking_status }}</td>
                  <td>{{ b.payment_status }}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <template v-if="b.booking_status === 'Cancelled'">
                        <span class="badge bg-danger">Cancelled</span>
                      </template>
                      <template v-else>
                        <button v-if="b.payment_status === 'Pending'" class="btn btn-success btn-sm" @click="payBooking(b.id)">Pay Now</button>
                        <span v-else-if="b.payment_status === 'Pending Verification'" class="badge bg-warning text-dark">Pending Verification</span>
                        <span v-else class="badge bg-success">Confirmed</span>
                        <button class="btn btn-outline-danger btn-sm" @click="cancelBooking(b.id)">Cancel</button>
                      </template>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    `,
  data() {
    return {
      username: localStorage.getItem("username") || "User",
      role: localStorage.getItem("role") || "",
      message: "",
      treks: [],
      bookings: [],
      trekSearch: "",
      difficultyFilter: "",
      durationFilter: "",
      editTrekMode: false,
      trekForm: {
        id: "",
        name: "",
        slots: "",
        status: "Open"
      },
      viewParticipants: false,
      selectedTrekId: ""
    }
  },

  mounted() {
    this.loadTreks()
    this.loadBookings()
  },
  methods: {
    getFilteredTreks() {
      return this.treks.filter(t => {
        const matchSearch = !this.trekSearch ||
          (t.name && t.name.toLowerCase().includes(this.trekSearch.toLowerCase())) ||
          (t.location && t.location.toLowerCase().includes(this.trekSearch.toLowerCase()));

        const matchDifficulty = !this.difficultyFilter || t.difficulty === this.difficultyFilter;

        const matchDuration = !this.durationFilter || parseInt(t.duration) <= parseInt(this.durationFilter);

        return matchSearch && matchDifficulty && matchDuration;
      });
    },
    getFilteredBookings() {
      if (!this.selectedTrekId) return []
      var result = []
      for (var i = 0; i < this.bookings.length; i++) {
        if (this.bookings[i].trek_id === this.selectedTrekId) {
          result.push(this.bookings[i])
        }
      }
      return result
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
          if (data.message) {
            this.treks = []
          } else {
            this.treks = data
          }
        })
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
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        },
        body: JSON.stringify(this.trekForm)
      })
        .then(response => response.json())
        .then(data => {
          this.message = data.message
          this.clearTrekForm()
          this.loadTreks()
        })
    },
    loadParticipants(trekId) {
      this.selectedTrekId = trekId
      this.viewParticipants = true
      this.loadBookings()
    },
    bookTrek(trek) {
      fetch('/api/bookings/create', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        },
        body: JSON.stringify({
          trek_id: trek.id,
          total_amount: trek.price,
          payment_status: "Pending",
          booking_status: "Pending"
        })
      })
        .then(response => response.json())
        .then(data => {
          this.message = data.message
          this.loadTreks()
          this.loadBookings()
        })
    },
    payBooking(bookingId) {
      fetch('/api/bookings/update/' + bookingId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        },
        body: JSON.stringify({
          payment_status: "Paid",
          booking_status: "Booked"
        })
      })
        .then(response => response.json())
        .then(data => {
          this.message = data.message
          this.loadBookings()
          this.loadTreks()
        })
    },
    cancelBooking(bookingId) {
      fetch('/api/bookings/update/' + bookingId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth-token")
        },
        body: JSON.stringify({
          booking_status: "Cancelled"
        })
      })
        .then(response => response.json())
        .then(data => {
          this.message = data.message
          this.loadBookings()
          this.loadTreks()
        })
    }
  }
}
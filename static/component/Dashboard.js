export default {
    template: `
    <div class="container mt-4">
      <div v-if="message" class="alert alert-success">
        {{ message }}
      </div>

      <div class="mb-4">
        <h4>Welcome, {{ username }}</h4>
      </div>

      <!-- STAFF DASHBOARD VIEW -->
      <div v-if="role.includes('staff')">
        <!-- Assigned Treks -->
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

        <!-- Inline Status/Slots Form for Staff -->
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

        <!-- Trekkers List for Staff -->
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

      <!-- TREKKER (USER) DASHBOARD VIEW -->
      <div v-else>
        <!-- Available Treks -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h4>Available Treks</h4>
            <input type="text" class="form-control form-control-sm w-25" placeholder="Search location..." v-model="trekSearch">
          </div>
          <div class="card-body">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Difficulty</th>
                  <th>Duration</th>
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
                  <td>{{ trek.duration }}</td>
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

        <!-- My Bookings -->
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
                    <button v-if="b.payment_status !== 'Paid'" class="btn btn-success btn-sm" @click="payBooking(b.id)">Pay Now</button>
                    <span v-else class="badge bg-success">Confirmed</span>
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
            if (!this.trekSearch) return this.treks
            var search = this.trekSearch.toLowerCase()
            var result = []
            for (var i = 0; i < this.treks.length; i++) {
                var t = this.treks[i]
                if ((t.name && t.name.toLowerCase().includes(search)) ||
                    (t.location && t.location.toLowerCase().includes(search))) {
                    result.push(t)
                }
            }
            return result
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
        }
    }
}
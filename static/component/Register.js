export default {
    template: `<div class="row justify-content-center align-items-center" style="min-height: 750px;">
    <div class="col-md-4 px-4">
        <div class="card px-4 shadow-sm">
            <p class="mx-2 mt-2 text-danger text-center" v-if="message">
                {{message}}
            </p>
            <h3 class="text-center mb-4">Register</h3>
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" id="username" class="form-control" placeholder="Enter Your UserName" v-model="formData.username">
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="text" id="email" class="form-control" placeholder="Enter Your Email" v-model="formData.email">
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" placeholder="Enter Your Password" v-model="formData.password">
            </div>
            <div class="mb-3">
                <label for="role" class="form-label">Register As</label>
                <select class="form-select" id="role" v-model="selectedRole">
                    <option value="user">Trekker (User)</option>
                    <option value="staff">Trek Staff (Guide)</option>
                </select>
            </div>
            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="exampleCheck1">
                <label class="form-check-label" for="exampleCheck1">Check me out</label>
            </div>
            <button class="btn btn-warning w-100 mt-2" @click="registerUser">Register</button>
        </div>
    </div>
</div>
`,
data() {
    return {
        message: '',
        selectedRole: 'user',
        formData: {
            username: '',
            email: '',
            password: ''
        }
    }
},
methods: {
    registerUser() {
        const payload = {
            username: this.formData.username,
            email: this.formData.email,
            password: this.formData.password,
            roles: [this.selectedRole]
        }
        fetch('/api/register', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                this.message = data.message
                if (!data.message.includes("already") && !data.message.includes("missing")) {
                    setTimeout(() => {
                        this.$router.push('/login')
                    }, 1500)
                }
            })
    }
}
}

const RegisterInfluencer = {
    template: `
        <section class="d-flex justify-content-center align-items-center h-100" style="background-image: url('frontend/assets/img/bg1.jpg'); background-size: cover;">
            <div class="register p-5 bg-white rounded" style="border-radius: 20px; max-width: 500px;">
                <h2 class="text-center mb-4">Register as Influencer</h2>
                <form @submit.prevent="register">
                    <div class="mb-3">
                        <label for="username" class="form-label">Username:</label>
                        <input type="text" id="username" v-model="username" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password:</label>
                        <input type="password" id="password" v-model="password" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="name" class="form-label">Name:</label>
                        <input type="text" id="name" v-model="name" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email:</label>
                        <input type="email" id="email" v-model="email" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="inf_category" class="form-label">Category:</label>
                        <input type="text" id="inf_category" v-model="inf_category" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="inf_niche" class="form-label">Niche:</label>
                        <input type="text" id="inf_niche" v-model="inf_niche" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label for="inf_reach" class="form-label">Reach:</label>
                        <input type="number" id="inf_reach" v-model="inf_reach" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Register</button>
                </form>
            </div>
        </section>
    `,
    data() {
        return {
            username: '',
            password: '',
            name: '',
            email: '',
            inf_category: '',
            inf_niche: '',
            inf_reach: 0,
        };
    },
    methods: {
        async register() {
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password,
                        name: this.name,
                        email: this.email,
                        is_influencer: true,
                        inf_category: this.inf_category,
                        inf_niche: this.inf_niche,
                        inf_reach: this.inf_reach,
                    }),
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Registration successful');
                    this.$router.push('/');
                } else {
                    alert(data.message || 'Registration failed');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred');
            }
        },
    },
};


export default RegisterInfluencer
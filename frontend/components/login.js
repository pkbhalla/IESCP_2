const Login = {
    template: `
    <section class="vh-100 gradient-form" style="background-image: url('frontend/assets/img/bg1.jpg'); background-size: cover;">
    <div class="container py-5 h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
            <div class="col-xl-10">
                <div class="card rounded-3 text-black">
                    <div class="row g-0">
                        <div class="col-lg-6">
                            <div class="card-body p-md-5 mx-md-4">

                                <div class="text-center">
                                    <h4 class="mt-1 mb-5 pb-1">IESCP </h4>
                                </div>

                                <div class="login">
            <h2>Login</h2>
            <form @submit.prevent="login">
            <div data-mdb-input-init class="form-outline mb-4">
                <label for="username">Username:</label>
                <input type="text" id="username" v-model="username" required>
            </div>
            <div data-mdb-input-init class="form-outline mb-4">
                <label for="password">Password:</label>
                <input type="password" id="password" v-model="password" required>
            </div>
                <div class="text-center pt-1 mb-5 pb-1">
                    <button class="btn btn-primary btn-block fa-lg gradient-custom-2 mb-3" type="submit">Login</button>
                </div>
            </form>
            <div class="d-flex align-items-center justify-content-center pb-4">
            <p class="mb-0 me-2">Don't have an account?</p>
            <button @click="$router.push('/register-sponsor')" class="btn btn-outline-danger">Register as Sponsor</button>
            <button @click="$router.push('/register-influencer')" class="btn btn-outline-danger">Register as Influencer</button>
            </div>
            </div>


                            </div>
                        </div>
                        <div class="col-lg-6 d-flex align-items-center gradient-custom-2">
                            <div class="text-white px-3 py-4 p-md-5 mx-md-4">
                                <h4 class="mb-4">Made with love</h4>
                                <p class="small mb-0">Influencer engangement and sponsorship coordination platform</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
    `,
    data() {
        return {
            username: '',
            password: '',
        };
    },
    methods: {
        async login() {
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password,
                    }),
                });
                const data = await response.json();
                if (response.ok) {
                   
                    localStorage.setItem('token', data.access_token);

                   
                    if (data.role === 'admin') {
                        this.$router.push('/admin-dashboard');
                    } else if (data.role === 'sponsor') {
                        this.$router.push('/sponsor-dashboard');
                    } else if (data.role === 'influencer') {
                        this.$router.push('/influencer-dashboard');
                    }
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Error logging in:', error);
                alert('An error occurred during login');
            }
        },
    },
};

export default Login
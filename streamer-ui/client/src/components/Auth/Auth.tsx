const Auth = {
    isAuthenticated: false,
    authenticate(username: string, password: string) {
        this.isAuthenticated = true;
    },
    signout() {
        this.isAuthenticated = false;
    },
    getAuth() {
        return this.isAuthenticated;
    }
};

export default Auth;

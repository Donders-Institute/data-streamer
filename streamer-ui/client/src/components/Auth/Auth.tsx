// consider axios

const Auth = {
    isAuthenticated: false,
    authenticate(username: string, password: string) {
        this.isAuthenticated = true;
        return "success";
    },
    signout() {
        this.isAuthenticated = false;
    },
    getAuth() {
        return this.isAuthenticated;
    }
};

export default Auth;

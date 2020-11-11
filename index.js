const store = {
    searchStarted: false,
    searchList: [],
    viewPageKey: ""
}

function generateHomePage() {
    return `
    <h1>Stream Finder</h1>
    <h3>Too many streaming services to keep track of? Search below to find out where to watch something!</h3>
    <form class="js-user-form">
        <label for="searchSubject">Search for a TV show or Movie!</label>
        <br>
        <input type="text" id="searchSubject" required>
        <button type="submit" class="js-submit">Search</button>
    </form>
    <div class="js-error-message hidden"></div>`
}

function render() {
    if(store.searchStarted === false) {
        renderHomeView();
    }
}
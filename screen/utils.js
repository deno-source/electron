module.exports = {
    getParams: function(url, param) {
        return new URL(url).searchParams.get(param);
    }
}
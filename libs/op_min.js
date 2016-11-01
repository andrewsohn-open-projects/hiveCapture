var site_count = 0;
function preload_test() {
    console.log('----------------: ' + site_count);
    ++site_count;
}
setInterval(preload_test, 3000);
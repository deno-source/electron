document.querySelectorAll('.a-view').forEach(ele => {
    let name = ele.$$dataset && (ele.$$dataset.gid || ele.$$dataset.url || ele.$$dataset.href);
    name && ele.setAttribute('link', name)
})
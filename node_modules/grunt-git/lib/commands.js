module.exports = {
    archive: require('./command_archive'),
    checkout: require('./command_checkout'),
    clean: require('./command_clean'),
    clone: require('./command_clone'),
    commit: require('./command_commit'),
    merge: require('./command_merge'),
    pull: require('./command_pull'),
    push: require('./command_push'),
    rebase: require('./command_rebase'),
    reset: require('./command_reset'),
    stash: require('./command_stash'),
    tag: require('./command_tag')
};

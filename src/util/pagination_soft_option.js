module.exports = {
    paginatoin_soft: (req, res, limit) => {
        var page = req.query.page
        if (page == undefined || page < 1) {
            page = 1
        }
        var column = res.locals.soft.column
        var type = res.locals.soft.type
        var params = '?'
        if (res.locals.soft.enabled) {
            params = '?soft=' + res.locals.soft.column + '&type=' + res.locals.soft.type + '&'
        }
        return {
            option: { page: page, limit: limit, sort: { [column]: type } },
            params,
            page
        }
    },
    pagination_href: (params, totalPages, page) => {

        var href = []
        var linkNext = params + 'page=' + (parseInt(page) + 1)
        var linkPrev = params + 'page=' + (parseInt(page) - 1)
        for (var i = 1; i <= totalPages; i++) {
            var object = {
                index: i,
                link: params + 'page=' + i,
                active: i == page ? 'active' : ''
            }
            href.push(object)
        }
        return {
            href,
            linkNext,
            linkPrev
        }
    }
}
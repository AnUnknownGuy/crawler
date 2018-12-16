const fetch = require("node-fetch");
const fs = require("fs");

String.prototype.base = function() {
    return this.split("/")[2].replace("www.", "");
};

String.prototype.countMatch = function(regex) {
    return ((this || '').match(regex) || []).length
};

function parseImg(img, url) {
    let quote = img.indexOf("src=\"") + 5,
        quote2 = img.substr(quote).indexOf("\"");
    let src = img.substr(quote, quote2);

    if (!src.startsWith("http"))
        return `<img src="http://${url.base()}/${src}">`;
    else
        return `<img src="${src}">`;
}

class Crawler {
    constructor() {
        this.visited = [];
        this.visiting = [];
    }

    async crawl(curUrl, depth, cb) {
        if (depth > 0) {
            this.visited.push(curUrl);
            this.visiting.push(curUrl.base());

            console.log(curUrl);

            try {
                let html = await fetch(curUrl).then(res => res.text());

                let links = html.match(/<a.*?href="http.*?"/g);
                if (links != null) {
                    links = links.map(tag => {
                        let quote = tag.indexOf("href=\"") + 6,
                            quote2 = tag.substr(quote).indexOf("\"");
                        return tag.substr(quote, quote2);
                    });

                    for (let i = 0; i < links.length; i++) {
                        let url = links.splice(Math.floor(Math.random() * links.length), 1)[0];
                        if (!this.visiting.includes(url.base()) && !this.visited.includes(url)) {
                            this.crawl(url, depth - 1, cb);
                        }
                    }
                }

                cb(html, curUrl);
            } catch (e) {}

            this.visiting.splice(this.visiting.indexOf(curUrl.base()));
        }
    }
}

class CrawlerIntern {
    constructor() {
        this.visited = [];
    }

    async crawl(curUrl, depth, cb) {
        if (depth > 0) {
            this.visited.push(curUrl);

            console.log(curUrl);

            try {
                let html = await fetch(curUrl).then(res => res.text());

                let links = html.match(/<a.*?href="http.*?"/g);
                if (links != null) {
                    links = links.map(tag => {
                        let quote = tag.indexOf("href=\"") + 6,
                            quote2 = tag.substr(quote).indexOf("\"");
                        return tag.substr(quote, quote2);
                    });

                    for (let i = 0; i < links.length; i++) {
                        let url = links.splice(Math.floor(Math.random() * links.length), 1)[0];
                        if (!this.visited.includes(url) && curUrl.base() === url.base()) {
                            this.crawl(url, depth - 1, cb);
                        }
                    }
                }

                cb(html, curUrl);
            } catch (e) {}
        }
    }
}

(async () => {
    fs.writeFile('test.html', '', () => {
        let michel = new CrawlerIntern();
        let allImg = [];
        michel.crawl("https://yande.re/post?tags=order%3Arandom", 6, (html, url) => {
            let imgs = html.match(/<img.*?>/g);
            imgs.map(img => {
                img = parseImg(img, url);
                if (!allImg.includes(img)) {
                    fs.appendFile('test.html', img + "<br>", () => {});
                    allImg.push(img);
                }
            });
        });
    });
})();



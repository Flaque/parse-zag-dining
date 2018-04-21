const got = require("got");
const cheer = require("cheerio");
const log = console.log;

const args = process.argv.slice(2);

const urlsafe = str => {
  str = str.split(" ").join("");
  str = str.replace("'", "");
  str = str.replace("'", ""); // fuck the system
  str = str.replace("é", "e");
  str = str.replace("&", "");

  return str;
};

// Yes really
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}

(async () => {
  const { body } = await got(
    "https://zagdining.sodexomyway.com/dining-near-me/retail"
  );

  let $ = cheer.load(body);

  // Names
  let names = [];
  $(".dining-halls-block-left.desktop-only h2").each(function(i, el) {
    names.push($(this).text());
  });

  // Addresses
  let addresses = [];
  $(".dining-halls-block-left.desktop-only p").each(function(i, el) {
    addresses.push($(this).text());
  });

  let hours = [];
  let descs = [];
  let phones = [];

  // Now parse each ones and description
  for (let name of names) {
    let urlkey = urlsafe(name);

    sleep(args[0] || 50);

    const { body } = await got(
      `https://zagdining.sodexomyway.com/dining-near-me/${urlkey}`
    );

    let $ = cheer.load(body);

    // hours
    hours.push(
      $(".idh-hours")
        .first()
        .text()
    );

    // desc
    descs.push(
      $(".rtf")
        .first()
        .text()
    );

    // phones
    phones.push(
      $(".desktop-only .phone")
        .first()
        .text()
    );
  }

  const total = [];

  // Now print out everything out
  for (let i in names) {
    total.push({
      name: names[i],
      hour: hours[i],
      desc: descs[i],
      phone: phones[i],
      address: addresses[i]
    });
  }

  log(JSON.stringify(total, null, 2));
})();

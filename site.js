// Everything that names the studio or holds its content lives here.
// Renaming the studio is one command, run from this folder (it also redraws the wordmark, favicons and
// link-preview picture, and rewrites every page that names the studio; see README.md):
//   python3 tools/rename.py "New Name"
// Edit `name` and `wordmark` through that command, not by hand. `wordmark` is how the drawn wordmark
// spells the name: the same letters, any case (each lowercase i gets a lit screen for its dot).

window.STUDIO = {
  name: "Kinetic",
  wordmark: "kinetic",
  city: "",                       // optional: put <span data-city></span> in a sentence and the place is written there
  // the contact address, also written 3 times in contact/index.html
  email: "hatimelhassak.official@gmail.com",
  subject: "Project quote",
  // Where the concept sites live, relative to this page: concepts/ in this folder, with their photos in
  // assets/photos (copied from the Studio workspace, Studio/concepts and Studio/assets/photos).
  conceptsBase: "concepts/"
};

// The menu: award-winning sites made by OTHER studios, shown with credit. None of them is ours.
window.TRADES = ["Company sites", "Shops", "Portfolios", "Product and tools"];
window.MENU = [
  {slug:"lajoya", name:"Lajoya", url:"https://lajoya-foods.com/en", maker:"Guillaume Azadian", award:"Awwwards Honorable Mention", date:"October 2026", trade:"Shops"},
  {slug:"theobroma", name:"Theobroma", url:"https://theobromachocolat.com/", maker:"Casa Media", award:"Awwwards Honorable Mention", date:"October 2026", trade:"Shops"},
  {slug:"agrumea-farm", name:"Agrumea Farm", url:"https://www.agrumeafarm.it/en", maker:"Studio K95", award:"Awwwards Site of the Day", date:"November 2026", trade:"Company sites"},
  {slug:"esr-bespoke", name:"ESR Bespoke", url:"https://www.esrbespoke.au/", maker:"NIGHTJAR", award:"Awwwards Site of the Day", date:"October 2026", trade:"Company sites"},
  {slug:"polpharma", name:"Polpharma Biologics", url:"https://www.polpharmabiologics.com/", maker:"Widelab", award:"CSS Design Awards Website of the Day", date:"November 2026", trade:"Company sites"},
  {slug:"endurosat", name:"Endurosat Space Service", url:"https://www.endurosat.com/space-service/", maker:"60FPS", award:"CSS Design Awards Website of the Day", date:"October 2026", trade:"Company sites"},
  {slug:"belgrade-arbor", name:"Belgrade Arbor", url:"https://belgradearbor.rs/en", maker:"Square43 Studio", award:"Awwwards Site of the Day", date:"October 2026", trade:"Company sites"},
  {slug:"justin-jefferson", name:"Justin Jefferson", url:"https://jjettas.com", maker:"LayerTwo", award:"Awwwards Site of the Day and FWA", date:"November 2026", trade:"Portfolios"},
  {slug:"g-colombel", name:"G. Colombel Portfolio 2026", url:"https://guillaumecolombel.fr/", maker:"Guillaume Colombel", award:"Awwwards Site of the Day", date:"October 2026", trade:"Portfolios"},
  {slug:"brandon-yasin", name:"Brandon Yasin", url:"https://brandonyasin.com", maker:"Brandon Yasin", award:"Awwwards Site of the Day", date:"October 2026", trade:"Portfolios"},
  {slug:"arthur-engel", name:"Arthur Engel", url:"https://aengel.io", maker:"Arthur Engel", award:"CSS Design Awards Website of the Day", date:"November 2026", trade:"Portfolios"},
  {slug:"shopify-editions", name:"Shopify Editions Winter '26", url:"https://www.shopify.com/editions/winter2026", maker:"Shopify Design", award:"FWA of the Day", date:"September 2026", trade:"Product and tools"},
  {slug:"oryzo", name:"Oryzo", url:"https://oryzo.ai/", maker:"Lusion", award:"FWA of the Day", date:"September 2026", trade:"Product and tools"},
  {slug:"illoca", name:"illoca", url:"https://illoca.unseen.co/", maker:"Unseen Studio", award:"FWA of the Day", date:"September 2026", trade:"Product and tools"},
  {slug:"grail", name:"Grail", url:"https://grail-app.com/", maker:"denormalized", award:"Awwwards Site of the Day", date:"November 2026", trade:"Product and tools"},
  {slug:"heron-ai", name:"Heron AI", url:"https://heronaiapp.com/", maker:"Bearplus", award:"Awwwards Site of the Day", date:"October 2026", trade:"Product and tools"}
];

// Our concept sites: made-up brands, each labelled as a concept on its own page.
// A slot with a slug is live when concepts/<slug>/index.html exists. When the page is served
// over http, its own <title> ("Name, what it is (concept)") is read and used. Slots without a slug
// show "Coming soon" until a concept folder is found (served by a server that lists folders, such as
// python3 -m http.server) or its slug is written here. `match` pairs a found concept with its slot.
window.CONCEPTS = [
  {slug:"noodle", kind:"Restaurant", name:"Long Pull", line:"A halal noodle house in Flushing where every order is pulled by hand.", shot:"noodle"},
  {slug:"settle", kind:"Fintech", name:"Settle", line:"Invoices that chase themselves, and tell you the minute the money lands.", shot:"settle"},
  {slug:"architect", kind:"Architect", name:"Lampblack", line:"Architects of solid houses.", shot:"architect", match:/architect/i},
  {slug:"skincare", kind:"Skincare shop", name:"Brim", line:"Mineral sunscreen and skincare.", shot:"skincare", match:/skin|serum|cleanser|skincare/i},
  {slug:"realty", kind:"Real-estate agency", name:"Stoop", line:"Brooklyn real estate.", shot:"realty", match:/real.?estate|realty|realtor|listings|apartments?|homes for/i},
  {slug:"saas", kind:"SaaS dashboard", name:"Baton", line:"Dispatch software for city couriers.", shot:"saas", match:/dashboard|saas|analytics|software/i},
  {slug:"agency", kind:"Creative agency", name:"Seven Words", line:"An outdoor advertising agency in New York.", shot:"agency", match:/agency|creative studio/i},
  {slug:"fitness", kind:"Fitness studio", name:"Pinch", line:"A bouldering gym in Gowanus.", shot:"fitness", match:/fitness|gym|pilates|yoga|workout|training/i}
];

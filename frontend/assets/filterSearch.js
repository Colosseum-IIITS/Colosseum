function filterCards(type) {
    let input = document.getElementById(type === 'organiser' ? 'searchOrganisers' : 'searchPlayers');
    let filter = input.value.toLowerCase();
    let cards = document.getElementsByClassName(type);

    for (let i = 0; i < cards.length; i++) {
    let username = cards[i].querySelector("h3").innerText.toLowerCase();
    let email = cards[i].querySelector("p").innerText.toLowerCase();
    if (username.includes(filter) || email.includes(filter)) {
        cards[i].style.display = "";
    } else {
        cards[i].style.display = "none";
    }
    }
}
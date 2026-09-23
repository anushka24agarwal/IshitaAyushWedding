const encodeSrc = (src) =>
  src
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

function initCarousel() {
  if (!highlights.length) return;
  const image = document.querySelector("[data-carousel-image]");
  const fit = document.querySelector("[data-fit]");
  const dots = document.querySelector("[data-carousel-dots]");
  let index = 0;

  highlights.forEach((_, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Show highlight ${i + 1}`);
    button.addEventListener("click", () => show(i));
    dots.append(button);
  });

  function sizeToImage() {
    const naturalW = image.naturalWidth;
    const naturalH = image.naturalHeight;
    if (!naturalW || !naturalH) return;

    const stage = fit.parentElement;
    const maxW = Math.max(280, stage.clientWidth - 44);
    const maxH = Math.min(window.innerHeight * 0.7, 820);
    const ratio = naturalW / naturalH;
    let width = maxW;
    let height = width / ratio;

    if (height > maxH) {
      height = maxH;
      width = height * ratio;
    }

    fit.style.width = `${Math.round(width)}px`;
    fit.style.height = `${Math.round(height)}px`;
  }

  function show(nextIndex) {
    index = (nextIndex + highlights.length) % highlights.length;
    const slide = highlights[index];
    image.classList.remove("is-ready");
    image.onload = () => {
      sizeToImage();
      image.classList.add("is-ready");
    };
    image.src = encodeSrc(slide.src);
    image.alt = `Highlight from ${slide.caption}`;
    [...dots.children].forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
    });
  }

  document.querySelector(".carousel-btn.prev").addEventListener("click", () => show(index - 1));
  document.querySelector(".carousel-btn.next").addEventListener("click", () => show(index + 1));
  window.addEventListener("resize", sizeToImage);
  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  });

  let touchX = 0;
  fit.addEventListener("touchstart", (event) => {
    touchX = event.changedTouches[0].screenX;
  });
  fit.addEventListener("touchend", (event) => {
    const delta = event.changedTouches[0].screenX - touchX;
    if (Math.abs(delta) > 40) show(index + (delta < 0 ? 1 : -1));
  });

  show(0);
}

function initPeople() {
  if (!people.length) return;
  const list = document.querySelector("[data-people-list]");
  const grid = document.querySelector("[data-person-grid]");
  const nameEl = document.querySelector("[data-person-name]");
  const countEl = document.querySelector("[data-person-count]");
  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");

  people.forEach((person, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = person.name;
    button.addEventListener("click", () => selectPerson(person.id));
    if (index === 0) button.classList.add("is-active");
    list.append(button);
  });

  function selectPerson(id) {
    const person = people.find((entry) => entry.id === id);
    [...list.children].forEach((button) => {
      button.classList.toggle("is-active", button.textContent === person.name);
    });
    nameEl.textContent = person.name;
    countEl.textContent = `${person.photos.length} photograph${person.photos.length === 1 ? "" : "s"}`;
    grid.replaceChildren();

    person.photos.forEach((photo) => {
      const card = document.createElement("button");
      card.className = "photo-card";
      card.type = "button";
      card.innerHTML = `
        <figure>
          <div class="frame"><img alt="${person.name}, ${photo.caption}" src="${encodeSrc(photo.src)}" /></div>
        </figure>
      `;
      card.addEventListener("click", () => {
        lightboxImage.src = encodeSrc(photo.src);
        lightboxImage.alt = `${person.name}, ${photo.caption}`;
        lightbox.showModal();
      });
      grid.append(card);
    });
  }

  document.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  selectPerson(people[0].id);
}

initCarousel();
initPeople();
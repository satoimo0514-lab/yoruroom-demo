(() => {
  "use strict";

  const sceneNames = ["home", "sleep", "room"];
  const sceneLabels = {
    home: "ホーム画面",
    sleep: "睡眠レポート画面",
    room: "マイルーム画面"
  };
  const tabs = Array.from(document.querySelectorAll("[role='tab']"));
  const panels = new Map(
    sceneNames.map((name) => [name, document.getElementById(`panel-${name}`)])
  );
  const liveRegion = document.getElementById("live-region");

  function announce(message) {
    liveRegion.textContent = "";
    window.setTimeout(() => {
      liveRegion.textContent = message;
    }, 30);
  }

  function showScene(name, shouldAnnounce = true) {
    if (!panels.has(name)) return;

    for (const [panelName, panel] of panels) {
      const isActive = panelName === name;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);

      if (isActive) {
        panel.classList.remove("is-entering");
        window.requestAnimationFrame(() => panel.classList.add("is-entering"));
        window.setTimeout(() => panel.classList.remove("is-entering"), 420);
      }
    }

    tabs.forEach((tab) => {
      const isSelected = tab.dataset.scene === name;
      tab.classList.toggle("is-selected", isSelected);
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
    });

    window.scrollTo({ top: 0, behavior: "auto" });
    if (shouldAnnounce) announce(`${sceneLabels[name]}を表示しました`);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => showScene(tab.dataset.scene));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;

      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex === index) return;

      event.preventDefault();
      tabs[nextIndex].focus();
      showScene(tabs[nextIndex].dataset.scene);
    });
  });

  const bedToggle = document.getElementById("bed-mode-toggle");
  const bedCard = document.getElementById("bed-status-card");
  const bedTitle = document.getElementById("bed-status-title");
  const bedDescription = document.getElementById("bed-status-description");
  const bedToggleLabel = document.getElementById("bed-toggle-label");
  const bedToggleIcon = document.getElementById("bed-toggle-icon");
  let bedModeEnabled = true;

  function renderBedMode() {
    bedCard.dataset.active = String(bedModeEnabled);
    bedToggle.setAttribute("aria-pressed", String(bedModeEnabled));
    bedTitle.textContent = bedModeEnabled ? "ベッドモード中" : "ベッドモード停止中";
    bedDescription.textContent = bedModeEnabled
      ? "寝室周辺でSNS時間を見守っています"
      : "手動でいつでも開始できます";
    bedToggleLabel.textContent = bedModeEnabled
      ? "ベッドモードを終了"
      : "ベッドモードを開始";
    bedToggleIcon.setAttribute("href", bedModeEnabled ? "#icon-stop" : "#icon-play");
  }

  bedToggle.addEventListener("click", () => {
    bedModeEnabled = !bedModeEnabled;
    renderBedMode();
    announce(bedModeEnabled ? "ベッドモードを開始しました" : "ベッドモードを終了しました");
  });

  const roomStage = document.getElementById("room-stage");
  const wallpaperButton = document.getElementById("wallpaper-button");
  const lampButton = document.getElementById("lamp-button");
  const lampButtonLabel = document.getElementById("lamp-button-label");
  const shopItems = Array.from(document.querySelectorAll(".shop-item"));
  const placedItems = Array.from(document.querySelectorAll("[data-placed]"));
  const wallpaperNames = ["青い壁紙", "夕焼け色の壁紙", "木の温もりを感じる壁紙"];
  const furnitureNames = {
    chair: "オークの椅子",
    plant: "ポトス",
    moon: "月のライト"
  };
  let wallpaperIndex = 0;
  let lampOn = true;
  let selectedItem = "chair";

  function updateRoomDescription() {
    const lightDescription = lampOn ? "点灯中のランプ" : "消灯中のランプ";
    roomStage.setAttribute(
      "aria-label",
      `${wallpaperNames[wallpaperIndex]}、${lightDescription}、${furnitureNames[selectedItem]}を配置した寝室`
    );
  }

  wallpaperButton.addEventListener("click", () => {
    roomStage.classList.remove(`wallpaper-${wallpaperIndex}`);
    wallpaperIndex = (wallpaperIndex + 1) % wallpaperNames.length;
    roomStage.classList.add(`wallpaper-${wallpaperIndex}`);
    updateRoomDescription();
    announce(`${wallpaperNames[wallpaperIndex]}に変更しました`);
  });

  lampButton.addEventListener("click", () => {
    lampOn = !lampOn;
    roomStage.classList.toggle("lamp-on", lampOn);
    lampButton.setAttribute("aria-pressed", String(lampOn));
    lampButtonLabel.textContent = lampOn ? "消灯" : "点灯";
    updateRoomDescription();
    announce(lampOn ? "ランプを点灯しました" : "ランプを消灯しました");
  });

  shopItems.forEach((button) => {
    button.addEventListener("click", () => {
      selectedItem = button.dataset.item;

      shopItems.forEach((item) => {
        const isSelected = item === button;
        item.classList.toggle("is-selected", isSelected);
        item.setAttribute("aria-pressed", String(isSelected));
      });

      placedItems.forEach((item) => {
        item.classList.toggle("is-visible", item.dataset.placed === selectedItem);
      });

      updateRoomDescription();
      announce(`${furnitureNames[selectedItem]}を部屋に配置しました`);
    });
  });

  renderBedMode();
  updateRoomDescription();
  showScene("home", false);

  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
        // The demo still works online when Service Worker registration is unavailable.
      });
    });
  }
})();

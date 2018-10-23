import { append, setStorage, getStorage, clamp } from '../utils';
import icons from '../icons';

export default class Volume {
  constructor(art, option) {
    this.art = art;
    this.option = option;
    this.isDroging = false;
    this.init();
    this.setVolumeHandle(getStorage('volume'));
  }

  init() {
    const { events: { proxy }, player } = this.art;
    this.$volume = append(this.option.ref, icons.volume);
    this.$volumeClose = append(this.option.ref, icons.volumeClose);
    this.$volumePanel = append(this.option.ref, '<div class="art-volume-panel"></div>');
    this.$volumeHandle = append(this.$volumePanel, '<div class="art-volume-slider-handle"></div>');
    this.$volumeClose.style.display = 'none';

    proxy(this.$volume, 'click', () => {
      this.$volume.style.display = 'none';
      this.$volumeClose.style.display = 'block';
      setStorage('volume', player.volume());
      player.volume(0);
    });

    proxy(this.$volumeClose, 'click', () => {
      this.$volume.style.display = 'block';
      this.$volumeClose.style.display = 'none';
    });

    proxy(this.option.ref, 'mouseenter', () => {
      this.$volumePanel.classList.add('art-volume-panel-hover');

      // TODO
      setTimeout(() => {
        this.setVolumeHandle(player.volume());
      }, 200);
    });

    proxy(this.option.ref, 'mouseleave', () => {
      this.$volumePanel.classList.remove('art-volume-panel-hover');
    });

    proxy(this.$volumePanel, 'click', event => {
      this.volumeChangeFromEvent(event);
    });

    proxy(this.$volumeHandle, 'mousedown', () => {
      this.isDroging = true;
    });

    proxy(this.$volumeHandle, 'mousemove', event => {
      if (this.isDroging) {
        this.volumeChangeFromEvent(event);
      }
    });

    proxy(document, 'mouseup', () => {
      if (this.isDroging) {
        this.isDroging = false;
      }
    });

    this.art.on('video:volumechange', () => {
      const percentage = player.volume();
      this.setVolumeHandle(percentage);
      if (percentage === 0) {
        this.$volume.style.display = 'none';
        this.$volumeClose.style.display = 'block';
      } else {
        this.$volume.style.display = 'block';
        this.$volumeClose.style.display = 'none';
      }
    });
  }

  volumeChangeFromEvent(event) {
    const { player } = this.art;
    const { left: panelLeft, width: panelWidth } = this.$volumePanel.getBoundingClientRect();
    const { width: handleWidth } = this.$volumeHandle.getBoundingClientRect();
    const percentage = clamp(event.x - panelLeft - handleWidth / 2, 0, panelWidth - handleWidth / 2) / (panelWidth - handleWidth);
    setStorage('volume', percentage);
    player.volume(percentage);
  }

  setVolumeHandle(percentage = 0.7) {
    const { width: panelWidth } = this.$volumePanel.getBoundingClientRect();
    const { width: handleWidth } = this.$volumeHandle.getBoundingClientRect();
    const width = handleWidth / 2 + (panelWidth - handleWidth) * percentage - handleWidth / 2;
    this.$volumeHandle.style.left = `${width}px`;
  }
}

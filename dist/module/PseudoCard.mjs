export default class PsuedoCard {
    constructor(front, back) {
        if (front !== '') {
            this.back = back !== '' ? { img: back } : null;
            this.showFace = true;
            this.faces = [{ img: front }];
            this.uuid = undefined;
            this.isOwner = false;
        } else {
            return false;
        }
    }
}
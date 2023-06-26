export class Dictionary<T> {
    items: { [key: string]: T } = {};
    length = 0;

    add(key: string, item: T) {
        this.length++;
        this.items[key] = item;
    }

    exist(key: string) {
        return this.items[key];
    }

    get(key: string) {
        return this.items[key];
    }

    each(callback: (key: string, item: T) => void | boolean | undefined) {
        Object.keys(this.items).forEach((key) => {
            var item = this.items[key];
            if (callback(key, item) === false) {
                return;
            }
        });
    }
}

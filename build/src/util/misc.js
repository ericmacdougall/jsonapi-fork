"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isPlainObject(obj) {
    return typeof obj === "object" && !(Array.isArray(obj) || obj === null);
}
exports.isPlainObject = isPlainObject;
function objectIsEmpty(obj) {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}
exports.objectIsEmpty = objectIsEmpty;
exports.reduceToObject = (makeKey) => (acc, it) => {
    acc[makeKey(it)] = it;
    return acc;
};
exports.reduceById = exports.reduceToObject(it => it.id);
function deleteNested(path, object) {
    try {
        const pathParts = path.split(".");
        const lastPartIndex = pathParts.length - 1;
        const lastPart = pathParts[lastPartIndex];
        const containingParts = pathParts.slice(0, lastPartIndex);
        const container = containingParts.reduce((obj, part) => obj[part], object);
        if (container.hasOwnProperty(lastPart)) {
            delete container[lastPart];
            return true;
        }
        else {
            throw new Error("The last property in the path didn't exist on the object.");
        }
    }
    catch (error) {
        return false;
    }
}
exports.deleteNested = deleteNested;
function isSubsetOf(setArr, potentialSubsetArr) {
    const set = new Set(setArr);
    return potentialSubsetArr.every((it) => set.has(it) === true);
}
exports.isSubsetOf = isSubsetOf;
function setDifference(minuendArr, subtrahendArr) {
    const res = new Set(minuendArr);
    subtrahendArr.forEach(it => res.delete(it));
    return res;
}
exports.setDifference = setDifference;
exports.stripLeadingBMPChar = (char) => (it) => {
    return it[0] === char ? it.slice(1) : it;
};
function partition(fnOrKey, items) {
    const partitionFn = typeof fnOrKey === 'function'
        ? fnOrKey
        : (it) => it[fnOrKey];
    return items.reduce((acc, item) => {
        const partitionName = partitionFn(item);
        acc[partitionName] = [...(acc[partitionName] || []), item];
        return acc;
    }, Object.create(null));
}
exports.partition = partition;
function pseudoTopSort(nodes, edges, roots) {
    roots = roots.slice();
    nodes = nodes.slice();
    edges = Object.assign({}, edges);
    Object.keys(edges).forEach(key => { edges[key] = Object.assign({}, edges[key]); });
    const sortResult = [];
    while (roots.length) {
        const thisRoot = roots.shift();
        const thisRootChildren = edges[thisRoot] || {};
        sortResult.push(thisRoot);
        Object.keys(thisRootChildren).forEach(child => {
            delete thisRootChildren[child];
            roots.push(child);
        });
    }
    return sortResult;
}
exports.pseudoTopSort = pseudoTopSort;

'use strict;'


export default class String {
    static isNullOrEmpty(str) {
        return str == null || str.length == 0;
    }
}
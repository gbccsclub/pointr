// 36h11 can store up to 587 (~2^9)
// 9 th bit is used to indicate the tag order
export function idToTags(id) {
    // 16 bits
    const most8bits = (id >> 8) & 0x00ff;
    const least8bits = id & 0x00ff;

    // use the 9th bit to indicate the tag order
    // 1: tag1,
    // 0: tag2
    const tag1Id = (1 << 8) | most8bits; 
    const tag2Id = least8bits;
    return [tag1Id, tag2Id];
}

export function isMostSignificantTag(id) {
    return (id >> 8) & 1;
}

export function tagsToId(tag1Id, tag2Id) {
    // 9 th bit of the first tag
    return isMostSignificantTag(tag1Id)
        ? ((tag1Id & 0x00ff) << 8) | (tag2Id & 0x00ff)
        : ((tag2Id & 0x00ff) << 8) | (tag1Id & 0x00ff);
}
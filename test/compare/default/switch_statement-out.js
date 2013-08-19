switch (fruit) {
    // case comment
    case Fruit.APPLE:
        // consequent comment
        apple();
        break;
    case Fruit.BANANA:
        banana();
        break;
    // case comment
    case Fruit.MANGO:
    // case comment
    case Fruit.PUPAYA:
        exotic();
        break;
    default:
        // consequent comment
        unknown();
}

call(function() {
    switch (fruit) {
        // case comment
        case Fruit.APPLE:
            // consequent comment
            exotic();
            break;
        default:
            unknown();
    }
});

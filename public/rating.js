class Rating {
    constructor(p1_score, p2_score, p1_rating, p2_rating) {
        this.p1_score = p1_score
        // this.p1_rating = p1_rating
        this.p2_score = p2_score
        // this.p2_rating = p2_rating
    }

    changeRating() {
        return (`${this.p1_rating} minus ${this.p2_rating} is ${this.p1_rating - this.p2_rating}`)
    }
}

module.exports = Rating

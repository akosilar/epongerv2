class Rating {
    constructor(p1_score, p2_score, p1_rating, p2_rating) {
        this.p1_score = p1_score
        this.p1_rating = p1_rating
        this.p2_score = p2_score
        this.p2_rating = p2_rating
    }

    determineRating(rating) {

        if (rating > 500) {
            return [60, 1]
        }
        else if (rating >= 400 && rating < 500) {
            return [50, 2]
        }
        else if (rating >= 300 && rating < 400) {
            return [40, 3]
        }
        else if (rating >= 200 && rating < 300) {
            return [30, 5]
        }
        else if (rating >= 100 && rating < 200) {
            return [25, 10]
        }
        else if (rating < 100)
            return [20, 20]

        return `from determinerating ${rating}`
    }

    changeRating() {

        const rating = this.determineRating(Math.abs(this.p2_rating - this.p1_rating))
        const p1_rating_change = this.p1_score * rating[1] - this.p2_score * rating[0]
        const p2_rating_change = this.p2_score * rating[0] - this.p1_score * rating[1]

        console.log(rating)
        console.log(`p1 score: ${this.p1_score} and p2 score: ${this.p2_score}`)
        console.log(`p1 will change ${p1_rating_change} and p2 will change ${p2_rating_change}`)
        console.log((`${this.p1_rating} minus ${this.p2_rating} is ${this.p1_rating - this.p2_rating}`))
        return [p1_rating_change, p2_rating_change]
    }
}

module.exports = Rating

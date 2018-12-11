import { check } from 'express-validator/check'

export const register = [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty(),
]

export default {
    register,
}

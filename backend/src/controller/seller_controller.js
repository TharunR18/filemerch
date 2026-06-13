import User from "../models/User.js";

export const setupSeller = async (req, res) => {
    try {
        const {
            upi_id,
            upi_name,
            username,
            bio,
            website,
            twitter,
            instagram,
            github,
            linkedin
        } = req.body;
        const user_id = req.userId;

        // 0. Check if user already has a username set (cannot change it)
        if (req.user && req.user.username) {
            return res.status(400).json({ success: false, message: "Username has already been set and cannot be changed" });
        }

        // 1. UPI ID Format Validation
        const upiValidation = (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9_-]+$/).test(upi_id);

        // 2. All fields present check
        if (!username)
            return res.status(400).json({
                message: "Username is required"
            });

        if (!upi_id)
            return res.status(400).json({
                message: "UPI ID is required"
            });

        if (!upi_name)
            return res.status(400).json({
                message: "Account holder name is required"
            });

        // 3. Username Length Check
        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ success: false, message: "Username must be between 3 and 30 characters" });
        }

        // 4. Username Allowed & Characters Check (Enforce lowercase)
        const usernameRegex = /^[a-z0-9_-]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ success: false, message: "Username can only contain lowercase letters, numbers, underscores, and hyphens." });
        }

        // 5. UPI validation check
        if (!upiValidation) {
            return res.status(400).json({ success: false, message: "Invalid UPI ID" });
        }

        // 6. Username uniqueness (excluding current user)
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== user_id) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }

        // 7. Save to Database
        const user = await User.findByIdAndUpdate(
            user_id,
            {
                upi_id,
                upi_name,
                username: username.toLowerCase(),
                is_seller: true,
                bio: bio || "",
                website: website || "",
                twitter: twitter || "",
                instagram: instagram || "",
                github: github || "",
                linkedin: linkedin || ""
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: "Seller setup completed successfully", user });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getSellerProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "Seller profile fetched successfully", user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const updateSellerProfile = async (req, res) => {
    try {
        const {
            upi_id,
            upi_name,
            bio,
            website,
            twitter,
            instagram,
            github,
            linkedin
        } = req.body;
        const user_id = req.userId;

        // UPI ID Validation if provided
        if (upi_id) {
            const upiValidation = (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9_-]+$/).test(upi_id);
            if (!upiValidation) {
                return res.status(400).json({ success: false, message: "Invalid UPI ID" });
            }
        }

        // Prepare the update object with only fields that are provided
        const updateData = {};
        if (upi_id !== undefined) updateData.upi_id = upi_id;
        if (upi_name !== undefined) updateData.upi_name = upi_name;
        if (bio !== undefined) updateData.bio = bio;
        if (website !== undefined) updateData.website = website;
        if (twitter !== undefined) updateData.twitter = twitter;
        if (instagram !== undefined) updateData.instagram = instagram;
        if (github !== undefined) updateData.github = github;
        if (linkedin !== undefined) updateData.linkedin = linkedin;

        const user = await User.findByIdAndUpdate(user_id, updateData, { new: true, runValidators: true });
        res.status(200).json({ success: true, message: "Seller profile updated successfully", user });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getSellerPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;

        // Find user by username and ensure they are a seller
        const user = await User.findOne({
            username: username.toLowerCase(),
            is_seller: true
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "Seller not found" });
        }

        // Return public profile details (exclude sensitive fields like upi_id, upi_name, etc.)
        res.status(200).json({
            success: true,
            message: "Seller public profile fetched successfully",
            seller: {
                _id: user._id,
                name: user.name,
                username: user.username,
                avatar_url: user.avatar_url,
                bio: user.bio,
                website: user.website,
                twitter: user.twitter,
                instagram: user.instagram,
                github: user.github,
                linkedin: user.linkedin,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

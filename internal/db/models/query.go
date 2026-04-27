package models

type Query[T any] interface {
	// SELECT * FROM @@table WHERE id=@id
	GetByID(id string) (T, error)

	// SELECT * FROM user WHERE email=@email
	GetUserByEmail(email string) (T, error)

	// SELECT * FROM user WHERE github_id=@providerId OR google_id=@providerId
	GetUserByProvider(providerId string) (T, error)

	// UPDATE user SET email=@email, name=@name, avatar_url=@avatarURL WHERE github_id=@providerId OR google_id=@providerId
	UpdateUserFromProvider(providerId, email, name, avatarURL string) error
}

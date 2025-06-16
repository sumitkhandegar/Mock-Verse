import React from 'react'

const page = () => {
  return (
    <div>
      <section>
        <div>
          <h1>Welcome to the Home Page</h1>
          <p>This is the main content of the home page.</p>
          <img src="/logo.png" alt="Logo" style={{ width: '50px', height: '50px' }} />
        </div>
      </section>
      <section>
        Take an Interview
      </section>
      <section>
        Your Interview
        // use interview card here
      </section>
    </div>
  )
}

export default page
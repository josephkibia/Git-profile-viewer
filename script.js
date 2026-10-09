// script.js

const usernameInput = document.getElementById('username-input');
const searchBtn = document.getElementById('search-btn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const profileSection = document.getElementById('profile-section');

async function fetchProfile(username) {

    //reset UI
    profileSection.hidden = true;
    errorEl.hidden = true;
    loadingEl.hidden = false;

    try{
        // Fetch profile and repos in parallel

        const[profileResponse, reposResponse] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos?sort=stars&perpage=5`)
        ]);

        if(!profileResponse.ok){
            if(profileResponse.status === 404){
                throw new Error(`User "${username}".Check the spelling and try again.`)
            }
            if(profileResponse.status === 403) {
                throw new Error(`API rate limit exceeded. Wait a minute and try again.`)
            }
            throw new Error(`GitHub API error: ${profileResponse.status}`);
        }
        const profile = await profileResponse.json();
        console.log(profile);
        const repos = await reposResponse.json();
        console.log(repos);

        displayProfile(profile, repos);
        
   }catch(error){
    errorEl.textContent = error.message;
    errorEl.hidden = false;

    }finally{
        loadingEl.hidden = true;
    }

    
}
function displayProfile( profile, repos){
    document.getElementById('avatar').src = profile.avatar_url;
    document.getElementById('display-name').textContent = profile.name || profile.login;
    document.getElementById('bio').textContent = profile.bio || 'No bio available.';
    document.getElementById('followers-count').textContent = profile.followers.toLocaleString();
    document.getElementById('following-count').textContent = profile.following.toLocaleString();
    document.getElementById('repos-count').textContent = profile.public_repos.toLocaleString();

    const repoList = document.getElementById('repos-list');
    repoList.innerHTML = '';

    if(repos.length === 0){
        repoList.innerHTML = '<p>No public repositories.</p>';
    } 
    else{
        repos.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'repo-card';

            card.innerHTML = `
              <h4>${repo.name}</h4>
              <p>${repo.description || 'No description.'}</p>
            
            `;
            repoList.appendChild(card);
        })
    }
    profileSection.hidden = false;
}

function handleSearch(){
    const username = usernameInput.value.trim();
    if(!username) return;
    fetchProfile(username)
}

searchBtn.addEventListener('click', handleSearch);
usernameInput.addEventListener('keydown', (event) =>{
    if(event.key === 'Enter'){
        handleSearch()
    }
})
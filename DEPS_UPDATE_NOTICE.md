chore(deps): pin three-mesh-bvh@^0.8.0 to match three and avoid BatchedMesh import error
- Added dependency three-mesh-bvh@^0.8.0 to package.json to align with three@^0.158.0

After this commit:
- Redeploy on Vercel (clear cache and redeploy recommended)
- If Vercel still fails during install, run the following locally and push package-lock.json for deterministic installs:
  git pull origin main
  npm install
  npm run build
  git add package-lock.json package.json
  git commit -m "chore(deps): update lockfile after pinning three-mesh-bvh"
  git push origin main

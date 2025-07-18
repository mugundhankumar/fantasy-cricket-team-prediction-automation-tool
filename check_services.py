import asyncio
import aiohttp
import sys

async def check_backend():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('http://localhost:8000/health') as response:
                if response.status == 200:
                    data = await response.json()
                    return data['status'] == 'healthy'
    except:
        return False
    return False

async def check_frontend():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('http://localhost:3000') as response:
                return response.status == 200
    except:
        return False
    return False

async def main():
    print("Checking GL Genie services...")
    
    print("\nChecking Backend...")
    backend_healthy = await check_backend()
    if backend_healthy:
        print("✅ Backend is running and healthy")
    else:
        print("❌ Backend is not running or has issues")
        
    print("\nChecking Frontend...")
    frontend_healthy = await check_frontend()
    if frontend_healthy:
        print("✅ Frontend is running")
    else:
        print("❌ Frontend is not running or has issues")
        
    if not backend_healthy or not frontend_healthy:
        print("\n❌ Some services are not running properly")
        sys.exit(1)
    else:
        print("\n✅ All services are running properly")
        sys.exit(0)

if __name__ == "__main__":
    asyncio.run(main())

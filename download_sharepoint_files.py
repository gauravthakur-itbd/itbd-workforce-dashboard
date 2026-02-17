"""
Simple script to download Excel files from SharePoint
Downloads MDE_UTILIZATION and csat_survey files
"""

import os
from dotenv import load_dotenv
from office365.runtime.auth.client_credential import ClientCredential
from office365.sharepoint.client_context import ClientContext
import pandas as pd
from datetime import datetime

# Load environment variables
load_dotenv()

def download_file_from_sharepoint(site_url, file_path, output_filename):
    """
    Download a file from SharePoint
    
    Args:
        site_url: Full SharePoint site URL
        file_path: Relative path to file in SharePoint
        output_filename: Local filename to save as
    """
    print(f"\n📥 Downloading: {file_path}")
    print(f"   Saving as: {output_filename}")
    
    try:
        # Get credentials from environment
        client_id = os.getenv('AZURE_CLIENT_ID')
        client_secret = os.getenv('AZURE_CLIENT_SECRET')
        
        # Authenticate
        credentials = ClientCredential(client_id, client_secret)
        ctx = ClientContext(site_url).with_credentials(credentials)
        
        # Download file
        response = ctx.web.get_file_by_server_relative_url(file_path).download()
        ctx.execute_query()
        
        # Save file
        with open(output_filename, "wb") as local_file:
            local_file.write(response.content)
        
        print(f"✅ Successfully downloaded: {output_filename} ({len(response.content)} bytes)")
        return True
        
    except Exception as e:
        print(f"❌ Error downloading {file_path}: {str(e)}")
        return False


def main():
    """Main function to download both Excel files"""
    print("="*70)
    print("📡 SharePoint File Downloader")
    print("="*70)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # SharePoint configuration
    site_url = os.getenv('SHAREPOINT_SITE_URL') + "/sites/CDG_SBDTeamSite"
    
    print(f"🔗 SharePoint Site: {site_url}")
    
    # File paths in SharePoint (based on your screenshot)
    files_to_download = [
        {
            'sharepoint_path': '/sites/CDG_SBDTeamSite/Automated-QBR/ACS-QBR/MDE _ UTILIZATION 10-2.xlsx',
            'local_filename': 'MDE_UTILIZATION_10-2.xlsx'
        },
        {
            'sharepoint_path': '/sites/CDG_SBDTeamSite/Automated-QBR/ACS-QBR/csat_survey.xlsx',
            'local_filename': 'csat_survey.xlsx'
        }
    ]
    
    # Download files
    success_count = 0
    for file_info in files_to_download:
        success = download_file_from_sharepoint(
            site_url,
            file_info['sharepoint_path'],
            file_info['local_filename']
        )
        if success:
            success_count += 1
    
    # Summary
    print("\n" + "="*70)
    print(f"📊 Download Summary: {success_count}/{len(files_to_download)} files downloaded")
    print("="*70)
    
    if success_count == len(files_to_download):
        print("\n✅ All files downloaded successfully!")
        
        # Quick preview of downloaded files
        print("\n📋 File Preview:")
        for file_info in files_to_download:
            filename = file_info['local_filename']
            if os.path.exists(filename):
                try:
                    df = pd.read_excel(filename)
                    print(f"\n  📄 {filename}:")
                    print(f"     - Rows: {len(df)}")
                    print(f"     - Columns: {len(df.columns)}")
                    print(f"     - Column names: {', '.join(df.columns[:5])}{'...' if len(df.columns) > 5 else ''}")
                except Exception as e:
                    print(f"\n  📄 {filename}: Unable to preview ({str(e)})")
    else:
        print("\n⚠️  Some files failed to download. Check the errors above.")
    
    print()


if __name__ == "__main__":
    main()

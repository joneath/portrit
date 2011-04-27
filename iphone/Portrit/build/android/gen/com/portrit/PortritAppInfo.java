package com.portrit;

import org.appcelerator.titanium.ITiAppInfo;
import org.appcelerator.titanium.TiApplication;
import org.appcelerator.titanium.TiProperties;
import org.appcelerator.titanium.util.Log;

/* GENERATED CODE
 * Warning - this class was generated from your application's tiapp.xml
 * Any changes you make here will be overwritten
 */
public final class PortritAppInfo implements ITiAppInfo
{
	private static final String LCAT = "AppInfo";
	
	public PortritAppInfo(TiApplication app) {
		TiProperties properties = app.getSystemProperties();
					
					properties.setString("ti.facebook.appid", "126374870731237");
					
					properties.setString("ti.deploytype", "development");
	}
	
	public String getId() {
		return "com.portrit";
	}
	
	public String getName() {
		return "Portrit";
	}
	
	public String getVersion() {
		return "1.0";
	}
	
	public String getPublisher() {
		return "joneath";
	}
	
	public String getUrl() {
		return "http://portrit.com";
	}
	
	public String getCopyright() {
		return "2011 by joneath";
	}
	
	public String getDescription() {
		return "No description provided";
	}
	
	public String getIcon() {
		return "appicon.png";
	}
	
	public boolean isAnalyticsEnabled() {
		return false;
	}
	
	public String getGUID() {
		return "2ee1dce7-9c8d-481b-a5f8-755ce8c5b799";
	}
	
	public boolean isFullscreen() {
		return false;
	}
	
	public boolean isNavBarHidden() {
		return false;
	}
}
